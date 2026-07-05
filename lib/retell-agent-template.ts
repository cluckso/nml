import { PlanType } from "@prisma/client"
import { getEffectivePlanType, hasPremiumElevenLabsVoice } from "./plans"
import { buildTemplateGlobalPrompt, RETELL_GLOBAL_PROMPT_TEMPLATE } from "./receptionist-prompt"

export { RETELL_GLOBAL_PROMPT_TEMPLATE, buildTemplateGlobalPrompt }

/**
 * Retell agent template: global prompt and variable names.
 * Must match dynamic_variables sent in app/api/webhooks/retell/route.ts (call_inbound).
 * Use {{variable_name}} in prompts — Retell replaces these per call from our webhook response.
 */

/**
 * Retell Agent Handbook presets — complements custom global prompt (not a replacement).
 * @see https://docs.retellai.com/build/agent-handbook
 */
export const RECEPTIONIST_HANDBOOK_CONFIG = {
  conversational_personality: true,
  high_empathy: true,
  speech_normalization: true,
  echo_verification: true,
  smart_matching: true,
  scope_boundaries: true,
  natural_filler_words: false,
  ai_disclosure: false,
  default_personality: false,
} as const

/** Cartesia platform voices (~$0.015/min) — standard tier for Solo Owner and Mid Volume default. */
export const STANDARD_CARTESIA_FEMALE_VOICE_ID = "cartesia-Emily"
export const STANDARD_CARTESIA_MALE_VOICE_ID = "cartesia-Nico"

/** Standard-tier voice (Cartesia TTS). Default for Solo Owner and Mid Volume without premium add-on. */
export const STANDARD_RETELL_VOICE = {
  voice_id: STANDARD_CARTESIA_FEMALE_VOICE_ID,
  voice_temperature: 0.9,
  voice_speed: 0.92,
  volume: 1.0,
  interruption_sensitivity: 0.68,
  max_call_duration_ms: 7 * 60 * 1000,
} as const

/** Premium ElevenLabs voice — Elite always; Mid Volume when premiumVoice enabled. */
export const DEFAULT_RETELL_VOICE = {
  voice_id: "11labs-Chloe",
  voice_temperature: 0.92,
  voice_speed: 0.9,
  volume: 1.0,
  interruption_sensitivity: 0.68,
  max_call_duration_ms: 7 * 60 * 1000,
} as const

export type RetellVoiceConfig = {
  voice_id: string
  voice_temperature: number
  voice_speed: number
  volume: number
  interruption_sensitivity: number
  max_call_duration_ms: number
}

/** Pick voice engine by plan: Cartesia for Starter and Pro default; ElevenLabs for Elite or Pro + premiumVoice. */
export function getRetellVoiceConfig(
  planType: PlanType | null | undefined,
  voiceGender?: string | null,
  premiumVoice?: boolean
): RetellVoiceConfig {
  const effective = getEffectivePlanType(planType)
  const useElevenLabs = hasPremiumElevenLabsVoice(effective, premiumVoice)
  if (!useElevenLabs) {
    const voice_id =
      voiceGender === "male" ? STANDARD_CARTESIA_MALE_VOICE_ID : STANDARD_CARTESIA_FEMALE_VOICE_ID
    return { ...STANDARD_RETELL_VOICE, voice_id }
  }
  const voice_id = voiceGender === "male" ? "11labs-Ethan" : "11labs-Chloe"
  return { ...DEFAULT_RETELL_VOICE, voice_id }
}

/** Base fields merged into every create-agent / update-agent payload for receptionist agents. */
export function receptionistAgentFields(voice: RetellVoiceConfig): Record<string, unknown> {
  return {
    voice_id: voice.voice_id,
    voice_temperature: voice.voice_temperature,
    voice_speed: voice.voice_speed,
    volume: voice.volume,
    max_call_duration_ms: voice.max_call_duration_ms,
    interruption_sensitivity: voice.interruption_sensitivity,
    handbook_config: { ...RECEPTIONIST_HANDBOOK_CONFIG },
  }
}

/** Variable names we send in call_inbound dynamic_variables. Use these in agent prompts with {{name}}. */
export const RETELL_DYNAMIC_VARIABLE_NAMES = [
  "business_name",
  "service_areas",
  "tone",
  "warmth_guidance",
  "strictness_guidance",
  "question_depth",
  "question_depth_guidance",
  "after_hours_behavior",
  "voice_style",
  "voice_gender",
  "intake_fields",
  "intake_template",
  "intake_template_guidance",
  "booking_ask_appointment",
  "booking_only_offer_when_asked",
  "booking_default_minutes",
  "booking_evaluation_minutes",
  "booking_slot_duration_minutes",
  "booking_service_time_rules",
  "booking_offer_time_windows",
  "booking_exact_slot",
  "booking_min_notice_hours",
  "booking_same_day_allowed",
  "booking_emergency_override",
  "lead_tags",
  "priority_rules",
  "always_say",
  "never_say",
  "compliance_phrases",
  "max_call_length_minutes",
  "question_retry_count",
  "escalate_after_retries",
  "emergency_forward",
  "emergency_forward_number",
  "spam_handling",
  "capacity_mode",
  "departments_json",
] as const
