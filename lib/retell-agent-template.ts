/**
 * Retell agent template: global prompt and variable names.
 * Must match dynamic_variables sent in app/api/webhooks/retell/route.ts (call_inbound).
 * Use {{variable_name}} in prompts — Retell replaces these per call from our webhook response.
 */

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
export const RETELL_GLOBAL_PROMPT_TEMPLATE = `You are a professional, {{tone}} AI voice assistant for {{business_name}}.
Callers should hear a smile in your voice — clear, calm, and confident.

Your role is to:
- Greet callers professionally
- Understand why they are calling
- Collect ONLY the information relevant to this business type (see intake_fields if provided)
- Capture accurate contact details
- Explain what happens next

Tone: Be {{tone}}. Question depth: {{question_depth}}. When outside business hours, behavior: {{after_hours_behavior}}.

Always be:
- Polite and professional
- Efficient and focused
- Patient and easy to understand
- Natural and conversational

NEVER:
- Ask unnecessary questions
- Collect payment information
- Give pricing or quotes
- Promise scheduling, availability, or outcomes
- Use filler words like "um", "uh", "well", "so"

If a situation requires emergency services, say "Nine-One-One" clearly.

Keep calls under {{max_call_length_minutes}} minutes when possible. If the caller is unclear, you may re-ask up to {{question_retry_count}} times before summarizing what you have.`
