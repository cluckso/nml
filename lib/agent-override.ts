import { getRetellVoiceConfig } from "./retell-agent-template"
import { PlanType } from "@prisma/client"
import { getEffectivePlanType, hasBrandedVoice } from "./plans"
import {
  computeRingDurationMsForInbound,
  resolveEffectiveRingDelayProfile,
  ringDurationMsForRetellAgent,
} from "./call-routing"
import type { BusinessSettings, QuestionDepth } from "./business-settings"

/** Map strictness slider (0=conversational, 1=strict script) to prompt guidance. */
export function buildStrictnessGuidance(strictness: number): string {
  if (strictness >= 0.7) {
    return "Follow the intake checklist in order. Cover every required field before moving on — do not skip steps."
  }
  if (strictness >= 0.4) {
    return "Cover all required intake fields, but adapt the order to what the caller already volunteered. Skip redundant questions."
  }
  return "Keep the conversation natural and flexible. Gather required details through dialogue rather than a rigid script — combine related questions when it flows well."
}

/** Map warmth slider (0=professional, 1=warm) to tone guidance. */
export function buildWarmthGuidance(warmth: number): string {
  if (warmth >= 0.7) {
    return "Sound especially warm and personable — use friendly acknowledgments, show empathy when callers describe problems, and leave them feeling cared for."
  }
  if (warmth >= 0.4) {
    return "Be approachable and professional — friendly without being overly casual."
  }
  return "Keep a polished, professional tone — courteous and efficient, with less small talk."
}

/** Map question depth setting to concrete behavior guidance. */
export function buildQuestionDepthGuidance(depth: QuestionDepth): string {
  switch (depth) {
    case "fast":
      return "Ask only essential questions — name, callback number, and a clear reason. Skip optional details unless the caller offers them."
    case "deep":
      return "Ask thorough follow-ups to understand scope, urgency, and context. One question at a time, but do not rush past important details."
    default:
      return "Ask the standard intake questions — enough detail for a useful callback summary without over-questioning."
  }
}

/** Model temperature from voice-brand sliders — higher when conversational/warm, lower when strict. */
export function computeModelTemperature(
  strictness: number,
  warmth: number,
  conciseness: number,
  brandedVoice: boolean,
  voiceBaseTemperature: number
): number {
  if (brandedVoice) {
    const base = 0.45 + (1 - strictness) * 0.2 + warmth * 0.12
    const concisenessAdjust = (conciseness - 0.5) * 0.08
    return Math.round(Math.min(1, Math.max(0.35, base + concisenessAdjust)) * 100) / 100
  }
  const base = 0.52 + (1 - strictness) * 0.12 + warmth * 0.06
  return Math.round(Math.min(1, Math.max(0.4, base)) * 100) / 100
}

/**
 * Build the agent_override and dynamic_variables that the Retell inbound webhook sends.
 * Used by both the webhook and the agent preview API so settings are applied identically.
 */
export function buildAgentOverride(
  settings: BusinessSettings,
  businessName: string,
  serviceAreas: string | string[],
  planType?: PlanType | null,
  at: Date = new Date()
): {
  agentOverride: {
    agent?: Record<string, unknown>
    retell_llm?: { begin_message: string; model_temperature?: number }
    conversation_flow?: { begin_message: string; model_temperature?: number }
  }
  dynamicVars: Record<string, string>
  beginMessage: string
  ringDurationMs: number
  effectiveRingProfile: ReturnType<typeof resolveEffectiveRingDelayProfile>
} {
  const effectivePlan = getEffectivePlanType(planType)
  const brandedVoice = hasBrandedVoice(effectivePlan)

  const strictness = settings.voiceBrand.strictness ?? 0.3
  const warmth = settings.voiceBrand.warmth ?? 0.7
  const conciseness = settings.voiceBrand.conciseness ?? 0.5

  const beginMessage = settings.greeting.customGreeting
    ? settings.greeting.customGreeting.replace(/\[business\]/gi, businessName)
    : `Hi, thanks for calling ${businessName}! Who am I speaking with today?`

  const strictnessGuidance = buildStrictnessGuidance(strictness)
  const warmthGuidance = buildWarmthGuidance(warmth)
  const questionDepthGuidance = buildQuestionDepthGuidance(settings.questionDepth)

  const dynamicVars: Record<string, string> = {
    business_name: businessName,
    BUSINESS_NAME: businessName,
    businessName: businessName,
    BusinessName: businessName,
    name: businessName,
    Name: businessName,
    service_areas: Array.isArray(serviceAreas) ? serviceAreas.join(", ") : serviceAreas,
    tone: settings.greeting.tone,
    warmth_guidance: warmthGuidance,
    strictness_guidance: strictnessGuidance,
    question_depth: settings.questionDepth,
    question_depth_guidance: questionDepthGuidance,
    after_hours_behavior: settings.availability.afterHoursBehavior,
    voice_style: settings.greeting.voiceStyle ?? "",
    voice_gender: settings.greeting.voiceGender ?? "",
    intake_fields: JSON.stringify(settings.intakeFields),
    intake_template: settings.intakeTemplate ?? "generic",
    booking_ask_appointment: String(settings.booking.askForAppointment),
    booking_only_offer_when_asked: String(settings.booking.onlyOfferWhenAsked ?? true),
    booking_default_minutes: String(settings.booking.defaultAppointmentMinutes ?? 60),
    booking_evaluation_minutes: String(settings.booking.evaluationAppointmentMinutes ?? 30),
    booking_slot_duration_minutes: String(settings.booking.slotDurationMinutes ?? 30),
    booking_service_time_rules: JSON.stringify(settings.booking.serviceTimeByJobType ?? []),
    booking_offer_time_windows: String(settings.booking.offerTimeWindows),
    booking_exact_slot: settings.booking.exactSlotVsPreference,
    booking_min_notice_hours: String(settings.booking.minNoticeHours),
    booking_same_day_allowed: String(settings.booking.sameDayAllowed),
    booking_emergency_override: String(settings.booking.emergencyOverride),
    lead_tags: settings.leadTags.customTags.join(", "),
    priority_rules: JSON.stringify(settings.leadTags.priorityRules),
    always_say: brandedVoice ? settings.voiceBrand.alwaysSay.join("; ") : "",
    never_say: brandedVoice ? settings.voiceBrand.neverSay.join("; ") : "",
    compliance_phrases: brandedVoice ? settings.voiceBrand.compliancePhrases.join("; ") : "",
    max_call_length_minutes: String(settings.aiBehavior.maxCallLengthMinutes),
    question_retry_count: String(settings.aiBehavior.questionRetryCount),
    escalate_after_retries: String(settings.aiBehavior.escalateToHumanAfterRetries),
    emergency_forward: String(settings.callRouting.emergencyForward),
    emergency_forward_number: settings.callRouting.emergencyForwardNumber ?? "",
    spam_handling: settings.callRouting.spamHandling,
  }

  const effectiveRingProfile = resolveEffectiveRingDelayProfile(
    settings.callRouting,
    settings.availability,
    at
  )
  const ringDurationMs = computeRingDurationMsForInbound(
    settings.callRouting,
    settings.availability,
    at
  )

  const voiceGender = settings.greeting.voiceGender
  const voiceBase = getRetellVoiceConfig(effectivePlan, voiceGender, settings.greeting.premiumVoice)
  const voiceId = voiceBase.voice_id

  const voiceSpeed = brandedVoice
    ? 0.75 + (settings.voiceBrand.speed ?? 0.5) * 0.75
    : voiceBase.voice_speed
  const voiceTemperature = brandedVoice
    ? 0.2 + conciseness * 0.35 + warmth * 0.35
    : voiceBase.voice_temperature

  const modelTemperature = computeModelTemperature(
    strictness,
    warmth,
    conciseness,
    brandedVoice,
    voiceBase.voice_temperature
  )

  const defaultInterruptSensitivity = voiceBase.interruption_sensitivity
  const interruptTolerance = settings.aiBehavior.interruptTolerance ?? defaultInterruptSensitivity

  // Max call duration: 7 minutes (420000 ms)
  const MAX_CALL_DURATION_MS = 7 * 60 * 1000

  const agentFields: Record<string, unknown> = {
    voice_id: voiceId,
    voice_speed: Math.round(voiceSpeed * 100) / 100,
    voice_temperature: Math.round(voiceTemperature * 100) / 100,
    interruption_sensitivity: interruptTolerance,
    max_call_duration_ms: Math.min(
      Math.max(60_000, (settings.aiBehavior.maxCallLengthMinutes ?? 7) * 60 * 1000),
      MAX_CALL_DURATION_MS
    ),
  }
  const retellRingMs = ringDurationMsForRetellAgent(ringDurationMs)
  if (retellRingMs != null) {
    agentFields.ring_duration_ms = retellRingMs
  }

  const agentOverride = {
    agent: agentFields,
    retell_llm: {
      begin_message: beginMessage,
      model_temperature: modelTemperature,
    },
    conversation_flow: {
      begin_message: beginMessage,
      model_temperature: modelTemperature,
    },
  }

  return { agentOverride, dynamicVars, beginMessage, ringDurationMs, effectiveRingProfile }
}
