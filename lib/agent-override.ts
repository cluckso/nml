import type { BusinessSettings } from "./business-settings"

/**
 * Build the agent_override and dynamic_variables that the Retell inbound webhook sends.
 * Used by both the webhook and the agent preview API so settings are applied identically.
 */
export function buildAgentOverride(
  settings: BusinessSettings,
  businessName: string,
  serviceAreas: string | string[]
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
  const beginMessage = settings.greeting.customGreeting
    ? settings.greeting.customGreeting.replace(/\[business\]/gi, businessName)
    : `Thanks for calling ${businessName}! Who am I speaking with today?`

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
    always_say: settings.voiceBrand.alwaysSay.join("; "),
    never_say: settings.voiceBrand.neverSay.join("; "),
    compliance_phrases: settings.voiceBrand.compliancePhrases.join("; "),
    max_call_length_minutes: String(settings.aiBehavior.maxCallLengthMinutes),
    question_retry_count: String(settings.aiBehavior.questionRetryCount),
    escalate_after_retries: String(settings.aiBehavior.escalateToHumanAfterRetries),
    emergency_forward: String(settings.callRouting.emergencyForward),
    emergency_forward_number: settings.callRouting.emergencyForwardNumber ?? "",
    spam_handling: settings.callRouting.spamHandling,
  }

  const ringBeforeAnswerSeconds = settings.callRouting.ringBeforeAnswerSeconds ?? 0
  const ringDurationMs = Math.min(15, Math.max(0, ringBeforeAnswerSeconds)) * 1000

  const voiceSpeed = 0.75 + (settings.voiceBrand.speed ?? 0.5) * 0.75
  const temperature = 0.2 + (settings.voiceBrand.conciseness ?? 0.5) * 0.6

  // Voice: male = Ethan, female/Auto = Chloe (default)
  const voiceGender = settings.greeting.voiceGender
  const voiceId =
    voiceGender === "male"
      ? "11labs-Ethan"
      : "11labs-Chloe"

  const agentOverride = {
    agent: {
      voice_id: voiceId,
      ...(ringDurationMs > 0 ? { ring_duration_ms: Math.round(ringDurationMs) } : {}),
      voice_speed: Math.round(voiceSpeed * 100) / 100,
      interruption_sensitivity: settings.aiBehavior.interruptTolerance ?? 0.5,
      max_call_duration_ms: Math.min(
        Math.max(60_000, (settings.aiBehavior.maxCallLengthMinutes ?? 10) * 60 * 1000),
        3600000
      ),
    },
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
