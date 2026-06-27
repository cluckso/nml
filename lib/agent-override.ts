import { getRetellVoiceConfig } from "./retell-agent-template"
import { PlanType } from "@prisma/client"
import { getEffectivePlanType, hasBrandedVoice } from "./plans"
import { computeRingDurationMs, ringDurationMsForRetellAgent } from "./call-routing"
import type { BusinessSettings } from "./business-settings"

/**
 * Build the agent_override and dynamic_variables that the Retell inbound webhook sends.
 * Used by both the webhook and the agent preview API so settings are applied identically.
 */
export function buildAgentOverride(
  settings: BusinessSettings,
  businessName: string,
  serviceAreas: string | string[],
  planType?: PlanType | null
): {
  agentOverride: {
    agent?: Record<string, unknown>
    retell_llm?: { begin_message: string; model_temperature?: number }
    conversation_flow?: { begin_message: string; model_temperature?: number }
  }
  dynamicVars: Record<string, string>
  beginMessage: string
  ringDurationMs: number
} {
  const effectivePlan = getEffectivePlanType(planType)
  const brandedVoice = hasBrandedVoice(effectivePlan)

  const beginMessage = settings.greeting.customGreeting
    ? settings.greeting.customGreeting.replace(/\[business\]/gi, businessName)
    : `Hi, thanks for calling ${businessName}! Who am I speaking with today?`

  const dynamicVars: Record<string, string> = {
    business_name: businessName,
    BUSINESS_NAME: businessName,
    businessName: businessName,
    BusinessName: businessName,
    name: businessName,
    Name: businessName,
    service_areas: Array.isArray(serviceAreas) ? serviceAreas.join(", ") : serviceAreas,
    tone: settings.greeting.tone,
    question_depth: settings.questionDepth,
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

  const ringDurationMs = computeRingDurationMs(settings.callRouting)

  const voiceGender = settings.greeting.voiceGender
  const voiceBase = getRetellVoiceConfig(effectivePlan, voiceGender)
  const voiceId = voiceBase.voice_id

  const voiceSpeed = brandedVoice
    ? 0.75 + (settings.voiceBrand.speed ?? 0.5) * 0.75
    : voiceBase.voice_speed
  const temperature = brandedVoice
    ? 0.2 + (settings.voiceBrand.conciseness ?? 0.5) * 0.6
    : voiceBase.voice_temperature

  // Max call duration: 7 minutes (420000 ms)
  const MAX_CALL_DURATION_MS = 7 * 60 * 1000

  const agentFields: Record<string, unknown> = {
    voice_id: voiceId,
    voice_speed: Math.round(voiceSpeed * 100) / 100,
    voice_temperature: Math.round(temperature * 100) / 100,
    interruption_sensitivity: settings.aiBehavior.interruptTolerance ?? 0.82,
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
      model_temperature: Math.round(temperature * 100) / 100,
    },
    conversation_flow: {
      begin_message: beginMessage,
      model_temperature: Math.round(temperature * 100) / 100,
    },
  }

  return { agentOverride, dynamicVars, beginMessage, ringDurationMs }
}
