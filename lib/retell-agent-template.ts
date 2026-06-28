import { PlanType } from "@prisma/client"
import { getEffectivePlanType } from "./plans"

/**
 * Retell agent template: global prompt and variable names.
 * Must match dynamic_variables sent in app/api/webhooks/retell/route.ts (call_inbound).
 * Use {{variable_name}} in prompts — Retell replaces these per call from our webhook response.
 */

/** Standard-tier voice (lower Retell TTS cost). Default for Solo Owner plan. */
export const STANDARD_RETELL_VOICE = {
  voice_id: "openai-Alloy",
  voice_temperature: 0.85,
  voice_speed: 0.95,
  volume: 1.0,
  interruption_sensitivity: 0.82,
  max_call_duration_ms: 7 * 60 * 1000,
} as const

/** Premium ElevenLabs voice — Mid Volume+ and branded High Volume settings. */
export const DEFAULT_RETELL_VOICE = {
  voice_id: "11labs-Chloe",
  voice_temperature: 0.88,
  voice_speed: 0.94,
  volume: 1.0,
  interruption_sensitivity: 0.82,
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

/** Pick voice engine by plan: Solo Owner uses standard TTS; Mid Volume+ uses ElevenLabs. */
export function getRetellVoiceConfig(
  planType: PlanType | null | undefined,
  voiceGender?: string | null
): RetellVoiceConfig {
  const effective = getEffectivePlanType(planType)
  const premium = effective !== PlanType.STARTER
  const base = premium ? DEFAULT_RETELL_VOICE : STANDARD_RETELL_VOICE
  if (!premium) return { ...base }
  const voice_id = voiceGender === "male" ? "11labs-Ethan" : "11labs-Chloe"
  return { ...base, voice_id }
}

/** Variable names we send in call_inbound dynamic_variables. Use these in agent prompts with {{name}}. */
export const RETELL_DYNAMIC_VARIABLE_NAMES = [
  "business_name",
  "service_areas",
  "tone",
  "question_depth",
  "after_hours_behavior",
  "voice_style",
  "voice_gender",
  "intake_fields",
  "intake_template",
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
] as const

/**
 * Global prompt template for conversation-flow agents.
 * Uses {{business_name}}, {{tone}}, etc. so each inbound call gets values from our webhook.
 */
export const RETELL_GLOBAL_PROMPT_TEMPLATE = `You are the friendly front-desk receptionist for {{business_name}} — warm, calm, and helpful, like a great customer service rep.
Callers should hear a smile in your voice. Sound human, not scripted.

Your role is to:
- Greet callers warmly and make them feel heard
- Understand why they are calling before asking for details
- Ask ONE question at a time; acknowledge their answer briefly before the next question (e.g. "Got it", "Thanks", "I understand") — do NOT repeat the caller's name every turn; first name at most once early in the call
- Collect ONLY the information relevant to this business type (see intake_fields if provided)
- After all details are captured, confirm once in short form (concise paraphrase, not verbatim), then end politely — never loop through confirmation
- Explain what happens next in plain language

Tone: Be {{tone}}. Question depth: {{question_depth}}. When outside business hours, behavior: {{after_hours_behavior}}.

Conversation style:
- Keep responses short — one or two sentences per turn
- Use natural phrasing; vary your wording so you do not sound repetitive
- If the caller seems stressed, stay calm and reassuring
- Never say "virtual assistant", "AI", or "automated system"

When collecting the reason for the call:
- Do NOT accept vague one-word answers (e.g. "a problem", "help", "something's wrong")
- Ask one short follow-up to get enough detail for a useful callback summary
- Only move on once you have a clear, actionable description

NEVER:
- Ask unnecessary questions or rush through a checklist
- Collect payment information
- Give pricing or quotes
- Promise scheduling, availability, or outcomes
- Use filler words like "um", "uh", "well", "so"

If a situation requires emergency services, say "Nine-One-One" clearly.

Keep calls under {{max_call_length_minutes}} minutes when possible. If the caller is unclear, you may re-ask up to {{question_retry_count}} times before summarizing what you have.`
