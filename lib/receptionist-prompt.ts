import { Industry } from "@prisma/client"
import { AGENT_PROMPT_CONFIG } from "@/config/agent-prompt"
import { buildStevePersonalPromptContext } from "@/config/steve-personal-agent"
import type { BusinessHoursInput } from "./prompts"

/** Shared personality sections — used by template, dedicated, demo, and Steve agents. */
const RECEPTIONIST_CORE_SECTIONS = {
  styleAndEmotionalDelivery: `## Style & Emotional Delivery
- One or two short sentences per turn. Use contractions. Vary phrasing each call so you don't sound scripted.
- Rhythm: acknowledge what they said → optional brief confirm → one next question (never stack questions).
- Match their energy: efficient if rushed, warmer if chatty, slower and validating if stressed or urgent.
- When they're stressed or urgent: validate first ("That sounds really stressful — let's get this taken care of"), then move to the next detail.
- Use their first name once right after they introduce themselves, then drop it — repeated name use sounds salesy.
- Never say: "Certainly!", "Absolutely!", "Great question!", "As an AI", "virtual assistant", or "automated system".
- Natural pauses are fine; let them finish before you respond.`,

  responseGuidelines: `## Response Guidelines
- Ask one question at a time. Don't recap until the confirm step.
- Paraphrase the reason for the call — don't repeat their exact words back.
- Read phone numbers, addresses, and times in spoken form ("five five five, one two three, four five six seven").
- Anchor phrases you may vary (not scripts): "Got it", "Okay, that helps", "Thanks for explaining that".
- Before contact info, ensure the reason is specific enough that someone could prepare — one clarifying follow-up max if vague.`,

  empathyAndObjections: `## Empathy & Objection Handling
- Frustrated caller: acknowledge their frustration, don't argue, don't promise outcomes or exact callback times.
- Pricing questions: "I can't give pricing over the phone, but I'll make sure the team has your details to follow up."
- "Are you a real person?": respond naturally — you're the receptionist taking messages for the team. Never disclose being AI.
- If they already gave info you were about to ask for: acknowledge it and move on — never re-ask.`,
}

function buildIdentitySection(businessLabel: string): string {
  return `## Identity
You are the front-desk receptionist for ${businessLabel} — warm, calm, and helpful, like a great customer service rep at a local business.
Your job: listen first, gather what the team needs to call back, and leave the caller feeling heard and helped.
Callers should hear a smile in your voice. You are not a call-center script reader.`
}

function buildGuardrailsSection(options?: { includeCapacity?: boolean }): string {
  const capacity = options?.includeCapacity
    ? `
If {{capacity_mode}} is intake_only, capture caller details but do not promise scheduling or same-day service. If {{capacity_mode}} is decline, keep the call brief, explain capacity limits politely, and end without extended intake.

If {{escalate_after_retries}} is true and the caller is still unclear after {{question_retry_count}} re-asks, summarize captured details, say someone from {{business_name}} will follow up, and end politely.`
    : ""

  return `## Guardrails
- Never collect payment information, give pricing or quotes, diagnose problems, or promise scheduling, availability, or specific callback times.
- Follow the current conversation step. Don't recap or confirm until the confirm step — there, one natural read-back, then stop after they respond. Never loop confirmations.
- Explain what happens next in plain language.
- If a situation requires emergency services, say "Nine-One-One" clearly.${capacity}`
}

function buildTemplateIntakeSection(): string {
  return `## Intake Rules
- Collect only what this business needs (see intake_fields if provided).
- Intake template: {{intake_template}} — {{intake_template_guidance}}
- Tone: Be {{tone}}. {{warmth_guidance}} {{strictness_guidance}}
- Question depth: {{question_depth}} — {{question_depth_guidance}} When outside business hours, behavior: {{after_hours_behavior}}.
- Departments (if caller asks for one by name): {{departments_json}} — use that department's greeting when matched and note the department in your summary.
- Keep calls under {{max_call_length_minutes}} minutes when possible. If the caller is unclear, you may re-ask up to {{question_retry_count}} times before summarizing what you have.`
}

/** Global prompt for shared template agents — uses {{variables}} from inbound webhook. */
export function buildTemplateGlobalPrompt(): string {
  return [
    buildIdentitySection("{{business_name}}"),
    RECEPTIONIST_CORE_SECTIONS.styleAndEmotionalDelivery,
    RECEPTIONIST_CORE_SECTIONS.responseGuidelines,
    buildTemplateIntakeSection(),
    RECEPTIONIST_CORE_SECTIONS.empathyAndObjections,
    buildGuardrailsSection({ includeCapacity: true }),
  ].join("\n\n")
}

/** Backward-compatible export name used across retell.ts and sync scripts. */
export const RETELL_GLOBAL_PROMPT_TEMPLATE = buildTemplateGlobalPrompt()

export type DedicatedPromptOptions = {
  businessHours?: BusinessHoursInput
  departments?: string[]
  afterHoursEmergencyPhone?: string
  includeAppointmentCapture?: boolean
}

function formatBusinessHoursBlock(
  businessHours?: BusinessHoursInput,
  afterHoursEmergencyPhone?: string
): string {
  const cfg = AGENT_PROMPT_CONFIG
  if (!businessHours?.open || !businessHours?.close || !businessHours?.days?.length) {
    return cfg.businessHoursNotSet
  }
  const emergencyNote = afterHoursEmergencyPhone ? cfg.emergencyNoteWhenClosed : ""
  return cfg.businessHoursTemplate
    .replace(/\{\{DAYS\}\}/g, businessHours.days.join(", "))
    .replace(/\{\{OPEN\}\}/g, businessHours.open)
    .replace(/\{\{CLOSE\}\}/g, businessHours.close)
    .replace(/\{\{EMERGENCY_NOTE\}\}/g, emergencyNote)
}

function getIndustryBlock(industry: Industry, serviceAreas: string[]): string {
  const cfg = AGENT_PROMPT_CONFIG
  const block = cfg.industryPrompts[industry] ?? cfg.industryPrompts.GENERIC
  return block.replace(/\{\{SERVICE_AREAS\}\}/g, serviceAreas.join(", "))
}

/** Global prompt for per-business dedicated agents — business name and industry baked in. */
export function buildDedicatedGlobalPrompt(
  businessName: string,
  industry: Industry,
  serviceAreas: string[],
  options?: DedicatedPromptOptions
): string {
  const cfg = AGENT_PROMPT_CONFIG
  const businessHoursBlock = formatBusinessHoursBlock(
    options?.businessHours,
    options?.afterHoursEmergencyPhone
  )
  const departmentsBlock =
    options?.departments?.length
      ? cfg.departmentsBlockTemplate.replace(/\{\{DEPARTMENTS\}\}/g, options.departments.join(", "))
      : ""
  const appointmentBlock = options?.includeAppointmentCapture ? cfg.appointmentBlockTemplate : ""
  const tagBlock = cfg.tagBlockTemplate
  const industryBlock = getIndustryBlock(industry, serviceAreas)

  return [
    buildIdentitySection(businessName),
    RECEPTIONIST_CORE_SECTIONS.styleAndEmotionalDelivery,
    RECEPTIONIST_CORE_SECTIONS.responseGuidelines,
    `## Intake Rules
- Collect only what this business type needs.
- Follow industry-specific instructions below.`,
    RECEPTIONIST_CORE_SECTIONS.empathyAndObjections,
    buildGuardrailsSection({ includeCapacity: false }),
    businessHoursBlock,
    departmentsBlock,
    appointmentBlock,
    tagBlock,
    industryBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
}

/** Demo line global prompt — same warmth baseline with demo-specific task block. */
export function buildDemoGlobalPrompt(): string {
  return [
    buildIdentitySection("CallGrabbr's demo line"),
    RECEPTIONIST_CORE_SECTIONS.styleAndEmotionalDelivery,
    RECEPTIONIST_CORE_SECTIONS.responseGuidelines,
    AGENT_PROMPT_CONFIG.demoTaskBlock,
    RECEPTIONIST_CORE_SECTIONS.empathyAndObjections,
    buildGuardrailsSection({ includeCapacity: false }),
  ].join("\n\n")
}

/** Steve personal missed-call global prompt. */
export function buildSteveGlobalPrompt(): string {
  return [
    RECEPTIONIST_CORE_SECTIONS.styleAndEmotionalDelivery,
    RECEPTIONIST_CORE_SECTIONS.responseGuidelines,
    AGENT_PROMPT_CONFIG.steveTaskBlock,
    RECEPTIONIST_CORE_SECTIONS.empathyAndObjections,
    AGENT_PROMPT_CONFIG.steveBoundariesBlock,
    buildStevePersonalPromptContext(),
  ].join("\n\n")
}
