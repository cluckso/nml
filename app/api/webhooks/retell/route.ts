import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  sendEmailNotification,
  sendSMSNotification,
  sendSMSToCaller,
  forwardToCrm,
} from "@/lib/notifications"
import { reportUsageToStripe } from "@/lib/stripe"
import { hasSmsToCallers, hasCrmForwarding, hasLeadTagging, getEffectivePlanType } from "@/lib/plans"
import { PlanType } from "@prisma/client"
import { rateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
    const limit = rateLimit(`webhook-retell-${ip}`, 100, 60000) // 100 requests per minute
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    // Verify webhook signature
    const signature = req.headers.get("x-retell-signature")
    const body = await req.text()
    
    if (!verifyRetellSignature(body, signature || "")) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle call completion event
    if (event.event === "call_ended" || event.event === "call_analysis") {
      await handleCallCompletion(event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Retell webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
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

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

async function handleCallCompletion(event: any) {
  const callId = event.call?.call_id
  const agentId = event.call?.agent_id

  if (!callId || !agentId) {
    console.error("Missing call_id or agent_id in webhook")
    return
  }

  // Find business by agent ID (include subscription for plan-based features)
  const business = await db.business.findUnique({
    where: { retellAgentId: agentId },
    include: { subscription: true },
  })

  if (!business) {
    console.error(`Business not found for agent ${agentId}`)
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

  const callData = {
    duration,
    minutes,
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

  try {
    await reportUsageToStripe(business.id, minutes)
  } catch (error) {
    console.error("Usage reporting error:", error)
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

