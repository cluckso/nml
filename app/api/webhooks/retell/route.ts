import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resolveClient } from "@/lib/resolve-client"
import { normalizeE164 } from "@/lib/normalize-phone"
import {
  sendEmailNotification,
  sendSMSNotification,
  sendSMSToCaller,
  forwardToCrm,
} from "@/lib/notifications"
import { reportUsageToStripe } from "@/lib/stripe"
import { isSubscriptionActive } from "@/lib/subscription"
import { hasSmsToCallers, hasCrmForwarding, hasLeadTagging, getEffectivePlanType } from "@/lib/plans"
import { FREE_TRIAL_MINUTES } from "@/lib/plans"
import { rateLimit } from "@/lib/rate-limit"
import { getAgentIdForInbound } from "@/lib/intake-routing"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(`webhook-retell-${ip}`, 100, 60000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const signature = req.headers.get("x-retell-signature")
    const body = await req.text()
    if (!verifyRetellSignature(body, signature || "")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body) as RetellCallWebhookEvent

    // Inbound: resolve client by forwarded_from; pick agent by to_number (service vs childcare intake)
    if (event.event === "call_inbound") {
      const inbound = (event as RetellInboundEvent).call_inbound
      const toNumber = inbound?.to_number
      const forwardedFrom =
        (inbound as { forwarded_from_number?: string; forwarded_from?: string })?.forwarded_from_number ??
        (inbound as { forwarded_from_number?: string; forwarded_from?: string })?.forwarded_from ??
        inbound?.from_number
      const client = await resolveClient(forwardedFrom)
      const agentId = getAgentIdForInbound(toNumber)
      if (!client || !agentId) {
        return NextResponse.json({ call_inbound: {} })
      }
      const forwardedFromNormalized = normalizeE164(forwardedFrom) ?? forwardedFrom
      return NextResponse.json({
        call_inbound: {
          override_agent_id: agentId,
          metadata: { client_id: client.id, forwarded_from_number: forwardedFromNormalized },
          dynamic_variables: { BUSINESS_NAME: client.name },
        },
      })
    }

    if (event.event === "call_ended" || event.event === "call_analysis") {
      await handleCallCompletion(event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Retell webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

interface RetellInboundEvent {
  event: "call_inbound"
  call_inbound?: { from_number?: string; to_number?: string }
}

function verifyRetellSignature(body: string, signature: string): boolean {
  // Retell webhook signature verification
  const webhookSecret = process.env.RETELL_WEBHOOK_SECRET
  if (!webhookSecret) {
    // In development, allow without signature
    return process.env.NODE_ENV === "development"
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex")

  const sigBuf = Buffer.from(signature, "utf8")
  const expectedBuf = Buffer.from(expectedSignature, "utf8")
  if (sigBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expectedBuf)
}

/** Minimal shape for Retell call_ended / call_analysis webhook payload. */
interface RetellCallAnalysis {
  caller_name?: string
  caller_phone?: string
  service_address?: string
  city?: string
  issue_description?: string
  extracted_variables?: {
    name?: string
    phone?: string
    address?: string
    city?: string
    issue_description?: string
    lead_tag?: string
    appointment_preference?: string
    department?: string
  }
  summary?: string
  call_summary?: string
  transcript?: string
  [key: string]: unknown
}

interface RetellCallWebhookEvent {
  event?: string
  call?: {
    call_id?: string
    agent_id?: string
    from_number?: string
    to_number?: string
    start_timestamp?: number
    end_timestamp?: number
    transcript?: string
    metadata?: { client_id?: string; forwarded_from_number?: string }
  }
  call_analysis?: RetellCallAnalysis
}

async function handleCallCompletion(event: RetellCallWebhookEvent) {
  const callId = event.call?.call_id
  if (!callId) {
    console.error("Missing call_id in webhook")
    return
  }

  const metadata = event.call?.metadata
  let business = metadata?.client_id
    ? await db.business.findUnique({
        where: { id: metadata.client_id },
        include: { subscription: true },
      })
    : null
  if (!business && metadata?.forwarded_from_number) {
    const resolved = await resolveClient(metadata.forwarded_from_number)
    business = resolved ?? null
  }
  if (!business && event.call?.from_number) {
    const resolved = await resolveClient(event.call.from_number)
    business = resolved ?? null
  }

  if (!business) {
    console.error(`Client not found for call ${callId} (metadata.client_id or forwarded_from)`)
    return
  }

  const planType = getEffectivePlanType(business.subscription?.planType)
  const analysis = event.call_analysis || {}
  const hasAnalysis = Object.keys(analysis).length > 0

  // Missed-call recovery: use whatever we have (call_ended may arrive before call_analysis)
  const structuredIntake = {
    name: analysis.caller_name || analysis.extracted_variables?.name,
    phone: analysis.caller_phone || analysis.extracted_variables?.phone || event.call?.from_number,
    address: analysis.service_address || analysis.extracted_variables?.address,
    city: analysis.city || analysis.extracted_variables?.city,
    issue_description: analysis.issue_description || analysis.extracted_variables?.issue_description,
    emergency: detectEmergency(analysis),
    appointment_preference: analysis.extracted_variables?.appointment_preference,
    department: analysis.extracted_variables?.department,
  }
  const leadTag = detectLeadTag(analysis, structuredIntake.emergency)
  const summary =
    analysis.summary || analysis.call_summary || (analysis.transcript ? String(analysis.transcript).slice(0, 500) : null)
  const appointmentRequest = structuredIntake.appointment_preference
    ? { preferredDays: undefined as string | undefined, preferredTime: undefined as string | undefined, notes: String(structuredIntake.appointment_preference) }
    : undefined

  const duration = event.call?.end_timestamp && event.call?.start_timestamp
    ? Math.floor((event.call.end_timestamp - event.call.start_timestamp) / 1000)
    : 0
  const minutes = duration / 60
  const missedCallRecovery = !hasAnalysis && (structuredIntake.phone || event.call?.from_number)

  const existingCall = await db.call.findUnique({
    where: { retellCallId: callId },
  })

  const callerNumber = event.call?.from_number ? normalizeE164(event.call.from_number) ?? event.call.from_number : undefined
  const forwardedFromNumber = metadata?.forwarded_from_number ? normalizeE164(metadata.forwarded_from_number) ?? metadata.forwarded_from_number : undefined
  const aiNumberAnswered = event.call?.to_number ? normalizeE164(event.call.to_number) ?? event.call.to_number : undefined

  const callData = {
    duration,
    minutes,
    callerNumber,
    forwardedFromNumber,
    aiNumberAnswered,
    transcript: analysis.transcript || event.call?.transcript || undefined,
    summary: summary || undefined,
    structuredIntake: structuredIntake as any,
    emergencyFlag: structuredIntake.emergency,
    leadTag: hasLeadTagging(planType) ? leadTag : undefined,
    department: structuredIntake.department || undefined,
    appointmentRequest: appointmentRequest as any,
    callerName: structuredIntake.name || undefined,
    callerPhone: structuredIntake.phone || undefined,
    issueDescription: structuredIntake.issue_description || undefined,
    missedCallRecovery: !!missedCallRecovery,
  }

  const call = existingCall
    ? await db.call.update({
        where: { id: existingCall.id },
        data: callData,
      })
    : await db.call.create({
        data: {
          retellCallId: callId,
          businessId: business.id,
          ...callData,
        },
      })

  // Mandatory test call: mark testCallVerifiedAt when we receive a completed call for this client (forwarded_from matched)
  if (!business.testCallVerifiedAt) {
    await db.business.update({
      where: { id: business.id },
      data: { testCallVerifiedAt: new Date() },
    })
  }

  // Notifications: email + SMS to owner; SMS to caller (Pro+); CRM forward (Pro+)
  try {
    const notifies = [
      sendEmailNotification(business, call, structuredIntake as any),
      sendSMSNotification(business, call, structuredIntake as any),
    ]
    if (hasSmsToCallers(planType) && structuredIntake.phone) {
      notifies.push(sendSMSToCaller(business, structuredIntake.phone, structuredIntake as any))
    }
    await Promise.all(notifies)
  } catch (error) {
    console.error("Notification error:", error)
  }

  try {
    if (hasCrmForwarding(planType)) {
      await forwardToCrm(business, call, structuredIntake as any)
    }
  } catch (error) {
    console.error("CRM forward error:", error)
  }

  const hasActiveSubscription = isSubscriptionActive(business.subscription)
  const isOnFormalTrial = !hasActiveSubscription && business.trialStartedAt != null

  if (isOnFormalTrial) {
    const updated = await db.business.update({
      where: { id: business.id },
      data: { trialMinutesUsed: { increment: minutes } },
    })
    const now = new Date()
    const exhausted = updated.trialMinutesUsed >= FREE_TRIAL_MINUTES
    const expired = updated.trialEndsAt != null && now > updated.trialEndsAt
    if (exhausted || expired) {
      await db.business.update({
        where: { id: business.id },
        data: { status: "PAUSED" },
      })
    }
  } else if (hasActiveSubscription) {
    try {
      await reportUsageToStripe(business.id, minutes)
    } catch (error) {
      console.error("Usage reporting error:", error)
    }
  }
}

function detectEmergency(analysis: any): boolean {
  const emergencyKeywords = [
    "flooding",
    "no heat",
    "gas smell",
    "burst pipe",
    "emergency",
    "urgent",
    "sparks",
    "smoke",
    "no power",
    "electrical fire",
    "no water",
    "frozen pipes",
  ]
  const text = JSON.stringify(analysis).toLowerCase()
  return emergencyKeywords.some((keyword) => text.includes(keyword))
}

function detectLeadTag(analysis: any, isEmergency: boolean): "EMERGENCY" | "ESTIMATE" | "FOLLOW_UP" | "GENERAL" {
  if (isEmergency) return "EMERGENCY"
  const raw = (analysis.extracted_variables?.lead_tag || analysis.lead_tag || "").toLowerCase()
  const text = JSON.stringify(analysis).toLowerCase()
  if (raw.includes("estimate") || text.includes("estimate") || text.includes("quote")) return "ESTIMATE"
  if (raw.includes("follow") || text.includes("follow-up") || text.includes("callback")) return "FOLLOW_UP"
  return "GENERAL"
}

