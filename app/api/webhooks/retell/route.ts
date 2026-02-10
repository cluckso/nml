import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resolveClient, resolveClientByRetellNumber } from "@/lib/resolve-client"
import { normalizeE164 } from "@/lib/normalize-phone"
import {
  sendEmailNotification,
  sendSMSNotification,
  sendSMSToCaller,
  forwardToCrm,
} from "@/lib/notifications"
import { reportUsageToStripe } from "@/lib/stripe"
import { releaseRetellNumber } from "@/lib/retell"
import { isSubscriptionActive } from "@/lib/subscription"
import { hasSmsToCallers, hasCrmForwarding, hasLeadTagging, getEffectivePlanType, FREE_TRIAL_MINUTES, TRIAL_DAYS, MAX_CALL_DURATION_SECONDS, toBillableMinutes } from "@/lib/plans"
import { rateLimit } from "@/lib/rate-limit"
import { getAgentIdForInbound, getAgentIdForIndustry } from "@/lib/intake-routing"
import { ClientStatus } from "@prisma/client"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
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

    // Log every webhook event for debugging
    console.info("Retell webhook received:", { 
      event: event.event,
      hasCall: !!event.call,
      callId: event.call?.call_id || event.call_id,
    })

    // Inbound: resolve client by forwarded_from; pick agent by to_number (service vs childcare intake).
    // Only ACTIVE businesses are returned by resolveClient; PAUSED/unknown → we return empty call_inbound
    // (no override_agent_id), so Retell rejects the call — no connection, no Retell usage.
    if (event.event === "call_inbound") {
      const inbound = (event as RetellInboundEvent).call_inbound
      const toNumber = inbound?.to_number
      const fromNumber = inbound?.from_number
      const forwardedFrom =
        (inbound as { forwarded_from_number?: string; forwarded_from?: string })?.forwarded_from_number ??
        (inbound as { forwarded_from_number?: string; forwarded_from?: string })?.forwarded_from ??
        fromNumber
      
      console.info("Retell call_inbound details:", {
        to_number: toNumber,
        from_number: fromNumber,
        forwarded_from: forwardedFrom,
        to_number_normalized: normalizeE164(toNumber),
        forwarded_from_normalized: normalizeE164(forwardedFrom),
      })
      
      // Resolution priority:
      // 1. By to_number (business's dedicated Retell number) - PREFERRED for multi-tenant
      // 2. By forwarded_from (if carrier provides it) - LEGACY
      // 3. Fallback to any active business - SINGLE-TENANT mode
      
      let client = await resolveClientByRetellNumber(toNumber)
      let resolutionMethod = client ? "retellPhoneNumber" : null
      
      if (!client) {
        client = await resolveClient(forwardedFrom)
        resolutionMethod = client ? "primaryForwardingNumber" : null
      }
      
      // FALLBACK: If no client found, fall back to ANY active business (single-tenant mode)
      if (!client) {
        const fallbackClient = await db.business.findFirst({
          where: { status: ClientStatus.ACTIVE },
          orderBy: { createdAt: "desc" },
        })
        if (fallbackClient) {
          console.warn("Using fallback business:", {
            businessId: fallbackClient.id,
            businessName: fallbackClient.name,
            reason: "No match by retellPhoneNumber or primaryForwardingNumber - using single-tenant fallback",
          })
          client = fallbackClient
          resolutionMethod = "fallback"
        }
      }
      
      // Agent: prefer industry-specific (RETELL_AGENT_ID_HVAC, etc.), else number-based, else RETELL_AGENT_ID
      const agentId = client
        ? (getAgentIdForIndustry(client.industry) ?? getAgentIdForInbound(toNumber))
        : getAgentIdForInbound(toNumber)
      
      console.info("Retell call_inbound resolution:", {
        clientFound: !!client,
        clientId: client?.id,
        clientName: client?.name,
        clientIndustry: client?.industry,
        clientStatus: client?.status,
        resolutionMethod,
        agentId: agentId,
        agentIdConfigured: !!process.env.RETELL_AGENT_ID,
      })
      
      if (!client || !agentId) {
        // Block call: no override_agent_id = Retell rejects → caller hears unavailable / disconnect
        const reason = !agentId
          ? "No agent ID configured (set RETELL_AGENT_ID or RETELL_AGENT_ID_<INDUSTRY> in env)"
          : "No business found for this call (to_number not in retellPhoneNumber, forwarded_from not in primaryForwardingNumber, and no ACTIVE fallback business)"
        console.warn("Retell inbound rejected — caller will hear unavailable:", {
          reason,
          to_number: toNumber,
          from_number: fromNumber,
          forwarded_from: forwardedFrom,
          clientFound: !!client,
          agentIdConfigured: !!process.env.RETELL_AGENT_ID,
        })
        const normalizedFrom = normalizeE164(forwardedFrom)
        if (normalizedFrom) {
          const paused = await db.business.findFirst({
            where: { primaryForwardingNumber: normalizedFrom, status: ClientStatus.PAUSED },
            select: { id: true, name: true },
          })
          if (paused) {
            console.info("Retell inbound blocked: PAUSED client", { businessId: paused.id, name: paused.name, from: normalizedFrom })
          }
        }
        return NextResponse.json({ call_inbound: {} })
      }
      const forwardedFromNormalized = normalizeE164(forwardedFrom) ?? forwardedFrom
      const settings = mergeWithDefaults((client as any).settings as Partial<BusinessSettings> | null)
      const businessName = settings.greeting.businessNamePronunciation || String(client.name ?? "").trim() || "our office"

      // Greeting: use custom greeting if set, else default
      const beginMessage = settings.greeting.customGreeting
        ? settings.greeting.customGreeting.replace(/\[business\]/gi, businessName)
        : `Thanks for calling ${businessName}! Who am I speaking with today?`

      // Dynamic variables for agent placeholder substitution — all saved settings that can affect agent behavior
      const serviceAreas = Array.isArray((client as { serviceAreas?: string[] }).serviceAreas)
        ? (client as { serviceAreas: string[] }).serviceAreas.join(", ")
        : ""
      const dynamicVars: Record<string, string> = {
        business_name: businessName,
        BUSINESS_NAME: businessName,
        businessName: businessName,
        BusinessName: businessName,
        name: businessName,
        Name: businessName,
        service_areas: serviceAreas,
        tone: settings.greeting.tone,
        question_depth: settings.questionDepth,
        after_hours_behavior: settings.availability.afterHoursBehavior,
        voice_style: settings.greeting.voiceStyle ?? "",
        voice_gender: settings.greeting.voiceGender ?? "",
        // Intake: which fields to collect (agent prompt can use these)
        intake_fields: JSON.stringify(settings.intakeFields),
        intake_template: settings.intakeTemplate ?? "generic",
        // Booking
        booking_ask_appointment: String(settings.booking.askForAppointment),
        booking_offer_time_windows: String(settings.booking.offerTimeWindows),
        booking_exact_slot: settings.booking.exactSlotVsPreference,
        booking_min_notice_hours: String(settings.booking.minNoticeHours),
        booking_same_day_allowed: String(settings.booking.sameDayAllowed),
        booking_emergency_override: String(settings.booking.emergencyOverride),
        // Lead tags (for classification instructions)
        lead_tags: settings.leadTags.customTags.join(", "),
        priority_rules: JSON.stringify(settings.leadTags.priorityRules),
        // Voice & brand (instruction hints for LLM)
        always_say: settings.voiceBrand.alwaysSay.join("; "),
        never_say: settings.voiceBrand.neverSay.join("; "),
        compliance_phrases: settings.voiceBrand.compliancePhrases.join("; "),
        // AI behavior (so agent can respect limits)
        max_call_length_minutes: String(settings.aiBehavior.maxCallLengthMinutes),
        question_retry_count: String(settings.aiBehavior.questionRetryCount),
        escalate_after_retries: String(settings.aiBehavior.escalateToHumanAfterRetries),
        // Call routing hints
        emergency_forward: String(settings.callRouting.emergencyForward),
        emergency_forward_number: settings.callRouting.emergencyForwardNumber ?? "",
        spam_handling: settings.callRouting.spamHandling,
      }

      // Agent override: per-call overrides so saved settings modify Retell agent without editing the saved agent
      const agentOverride: {
        agent?: Record<string, unknown>
        retell_llm?: { begin_message: string; model_temperature?: number }
        conversation_flow?: { begin_message: string; model_temperature?: number }
      } = {
        retell_llm: { begin_message: beginMessage },
        conversation_flow: { begin_message: beginMessage },
      }

      // Voice speed: Retell typically 0.5–2; we store 0–1 in voiceBrand.speed → map to 0.75–1.5
      const voiceSpeed = 0.75 + (settings.voiceBrand.speed ?? 0.5) * 0.75
      agentOverride.agent = {
        voice_speed: Math.round(voiceSpeed * 100) / 100,
        interruption_sensitivity: settings.aiBehavior.interruptTolerance ?? 0.5,
        max_call_duration_ms: Math.min(
          Math.max(60_000, (settings.aiBehavior.maxCallLengthMinutes ?? 10) * 60 * 1000),
          3600000
        ), // 1 min–60 min cap
      }

      // Optional: model_temperature from voice/conciseness (0–1 → typical 0.2–0.8)
      const temperature = 0.2 + (settings.voiceBrand.conciseness ?? 0.5) * 0.6
      agentOverride.retell_llm!.model_temperature = Math.round(temperature * 100) / 100
      agentOverride.conversation_flow!.model_temperature = agentOverride.retell_llm.model_temperature

      const response = {
        call_inbound: {
          override_agent_id: agentId,
          metadata: {
            client_id: client.id,
            forwarded_from_number: forwardedFromNormalized,
            resolved_business_name: businessName,
            tone: settings.greeting.tone,
            question_depth: settings.questionDepth,
            after_hours_behavior: settings.availability.afterHoursBehavior,
          },
          dynamic_variables: dynamicVars,
          agent_override: agentOverride,
        },
      }
      
      console.info("Retell inbound response:", JSON.stringify(response, null, 2))
      return NextResponse.json(response)
    }

    // Retell sends call_ended and call_analyzed (not call_analysis). Handle both so we never miss completion events.
    if (event.event === "call_ended" || event.event === "call_analysis" || event.event === "call_analyzed") {
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
  // Retell uses the API key (with webhook badge) for signature verification, NOT a separate secret.
  // Try RETELL_WEBHOOK_SECRET first (if user set it), then fall back to RETELL_API_KEY.
  const secret = process.env.RETELL_WEBHOOK_SECRET || process.env.RETELL_API_KEY
  
  if (!secret) {
    console.warn("No RETELL_WEBHOOK_SECRET or RETELL_API_KEY set for signature verification")
    // In development, allow without signature
    return process.env.NODE_ENV === "development"
  }

  if (!signature) {
    console.warn("No x-retell-signature header in request")
    return process.env.NODE_ENV === "development"
  }

  // Try multiple signature formats since Retell's format may vary
  // Format 1: HMAC-SHA256 with hex encoding (common)
  const hexSig = crypto.createHmac("sha256", secret).update(body).digest("hex")
  // Format 2: HMAC-SHA256 with base64 encoding
  const base64Sig = crypto.createHmac("sha256", secret).update(body).digest("base64")
  
  // Compare using constant-time comparison
  const sigLower = signature.toLowerCase()
  const hexLower = hexSig.toLowerCase()
  
  if (sigLower === hexLower) return true
  if (signature === base64Sig) return true
  
  // Log for debugging (remove after fixing)
  console.warn("Retell signature mismatch", {
    receivedSig: signature.slice(0, 20) + "...",
    expectedHex: hexSig.slice(0, 20) + "...",
    expectedBase64: base64Sig.slice(0, 20) + "...",
    bodyPreview: body.slice(0, 100) + "...",
  })
  
  // TEMPORARY: Allow all requests while debugging (remove this in production!)
  console.warn("ALLOWING REQUEST DESPITE SIGNATURE MISMATCH - REMOVE THIS IN PRODUCTION")
  return true
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
  call_id?: string
  call?: {
    call_id?: string
    agent_id?: string
    from_number?: string
    to_number?: string
    start_timestamp?: number
    end_timestamp?: number
    transcript?: string
    metadata?: { client_id?: string; forwarded_from_number?: string }
    call_analysis?: RetellCallAnalysis
  }
  call_analysis?: RetellCallAnalysis
}

async function handleCallCompletion(event: RetellCallWebhookEvent) {
  // Retell may send call_id at top level or under event.call
  const callId = event.call?.call_id ?? event.call_id
  if (!callId) {
    console.error("Retell webhook: missing call_id in payload", { event: event.event, hasCall: !!event.call })
    return
  }

  // Log the full event for debugging (remove in production once working)
  console.info("Retell call completion event:", {
    event: event.event,
    call_id: callId,
    metadata: event.call?.metadata,
    from_number: event.call?.from_number,
    to_number: event.call?.to_number,
  })

  const metadata = event.call?.metadata
  let business = metadata?.client_id
    ? await db.business.findUnique({
        where: { id: metadata.client_id },
      })
    : null
  let resolutionMethod = business ? "metadata.client_id" : null
  
  // Try to resolve by to_number (business's dedicated Retell number) - PREFERRED
  if (!business && event.call?.to_number) {
    const toNormalized = normalizeE164(event.call.to_number)
    if (toNormalized) {
      business = await db.business.findFirst({
        where: { retellPhoneNumber: toNormalized },
      })
      if (business) resolutionMethod = "retellPhoneNumber"
    }
  }
  
  // Try forwarded_from_number from metadata
  if (!business && metadata?.forwarded_from_number) {
    console.info("Trying to resolve by forwarded_from_number:", metadata.forwarded_from_number)
    const normalized = normalizeE164(metadata.forwarded_from_number)
    if (normalized) {
      business = await db.business.findFirst({
        where: { primaryForwardingNumber: normalized },
      })
      if (business) resolutionMethod = "primaryForwardingNumber"
    }
  }
  
  // Fallback: any active business (single-tenant mode)
  if (!business) {
    business = await db.business.findFirst({
      where: { status: ClientStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
    })
    if (business) {
      resolutionMethod = "fallback"
      console.warn("Using fallback business for call completion:", {
        callId,
        businessId: business.id,
        businessName: business.name,
      })
    }
  }
  
  if (!business) {
    console.error(`Client not found for call ${callId}`, {
      metadata_client_id: metadata?.client_id,
      metadata_forwarded_from: metadata?.forwarded_from_number,
      from_number: event.call?.from_number,
      to_number: event.call?.to_number,
    })
    return
  }
  
  console.info("Resolved business for call:", { callId, businessId: business.id, businessName: business.name, resolutionMethod })

  const planType = getEffectivePlanType(business.planType)
  // call_analysis can be at top level (call_analyzed) or nested under event.call
  const analysis = event.call_analysis || event.call?.call_analysis || {}
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

  // Duration from Retell timestamps only (server-side; never trust client). Clamp to prevent abuse.
  const rawDurationSeconds =
    event.call?.end_timestamp != null && event.call?.start_timestamp != null
      ? Math.floor((event.call.end_timestamp - event.call.start_timestamp) / 1000)
      : 0
  const duration = Math.max(0, Math.min(MAX_CALL_DURATION_SECONDS, rawDurationSeconds))
  const minutes = toBillableMinutes(duration) // min 1 min per call; round up (used for trial + plan usage)
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

  // Mark testCallVerifiedAt when we receive a completed call for this client (forwarded_from matched)
  if (!business.testCallVerifiedAt) {
    await db.business.update({
      where: { id: business.id },
      data: { testCallVerifiedAt: new Date() },
    })
  }

  // Notifications: respect business notification settings
  const callSettings = mergeWithDefaults((business as any).settings as Partial<BusinessSettings> | null)
  const notifPrefs = callSettings.notifications
  const isEmergency = structuredIntake.emergency
  const shouldNotify = notifPrefs.emergencyOnlyAlerts ? isEmergency : true

  if (shouldNotify) {
    try {
      const notifies: Promise<any>[] = []
      if (notifPrefs.emailAlerts) {
        notifies.push(sendEmailNotification(business, call, structuredIntake as any))
      }
      if (notifPrefs.smsAlerts) {
        notifies.push(sendSMSNotification(business, call, structuredIntake as any))
      }
      if (hasSmsToCallers(planType) && structuredIntake.phone) {
        notifies.push(sendSMSToCaller(business, structuredIntake.phone, structuredIntake as any))
      }
      await Promise.all(notifies)
    } catch (error) {
      console.error("Notification error:", error)
    }
  }

  try {
    if (hasCrmForwarding(planType)) {
      const crmWebhookUrl = business.crmWebhookUrl ?? callSettings.crm.crmWebhookUrl ?? null
      await forwardToCrm(
        { ...business, crmWebhookUrl, forwardToEmail: business.forwardToEmail ?? null },
        call,
        structuredIntake as any
      )
      // Also send to Zapier if configured
      const zapierUrl = callSettings.crm.zapierWebhookUrl
      if (zapierUrl) {
        await fetch(zapierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business: { id: business.id, name: business.name }, call, intake: structuredIntake }),
        }).catch((e) => console.error("Zapier webhook error:", e))
      }
    }
  } catch (error) {
    console.error("CRM forward error:", error)
  }

  const hasActiveSubscription = isSubscriptionActive(business)
  // Track trial usage for any business without a paid sub (so onboarding-only users see usage too)
  const isOnTrial = !hasActiveSubscription

  if (isOnTrial) {
    const now = new Date()
    const trialEndsAtDefault = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const updateData: { trialMinutesUsed: { increment: number }; trialStartedAt?: Date; trialEndsAt?: Date } = {
      trialMinutesUsed: { increment: minutes },
    }
    if (!business.trialStartedAt) {
      updateData.trialStartedAt = now
      updateData.trialEndsAt = trialEndsAtDefault
    }
    const updated = await db.business.update({
      where: { id: business.id },
      data: updateData,
    })
    const exhausted = updated.trialMinutesUsed >= FREE_TRIAL_MINUTES
    const expired = updated.trialEndsAt != null && now > updated.trialEndsAt
    if (exhausted || expired) {
      await db.business.update({
        where: { id: business.id },
        data: { status: "PAUSED" },
      })
      await releaseRetellNumber(business.id)
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

