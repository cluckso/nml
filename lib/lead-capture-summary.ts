import type { Industry } from "@prisma/client"
import type { IntakeFieldConfig, IntakeTemplate } from "@/lib/business-settings"
import {
  buildIntakeTemplateGuidance,
  getIntakeTemplateMeta,
  type IntakeTemplateMeta,
} from "@/lib/intake-presets"

/** Display labels for intake field toggles (Settings + previews). */
export const INTAKE_FIELD_LABELS: Record<keyof IntakeFieldConfig, string> = {
  name: "Caller name",
  phone: "Phone number",
  address: "Address",
  email: "Email",
  serviceType: "Service type",
  urgency: "Urgency level",
  budgetRange: "Budget range",
  appointmentPreference: "Appointment preference",
}

/** Map onboarding industry to the closest intake template for labels/guidance. */
export function industryToIntakeTemplate(industry: Industry | string | null | undefined): IntakeTemplate {
  switch (industry) {
    case "HVAC":
      return "hvac"
    case "PLUMBING":
      return "plumbing"
    case "ELECTRICIAN":
      return "electrician"
    case "AUTO_REPAIR":
      return "auto_repair"
    case "HANDYMAN":
      return "handyman"
    case "CHILDCARE":
      return "childcare"
    default:
      return "generic"
  }
}

export function resolveEffectiveIntakeTemplate(
  template: IntakeTemplate | null | undefined,
  industry?: Industry | string | null
): IntakeTemplate {
  return template ?? industryToIntakeTemplate(industry)
}

export type LeadCaptureSummary = {
  required: string[]
  optional: string[]
  industryExtras: string[]
  sampleSteps: string[]
  templateLabel: string
  templateId: IntakeTemplate
  /** Short line for agent preview cards */
  previewLine: string
}

/** Build a transparent summary of what the live assistant is set to capture. */
export function buildLeadCaptureSummary(
  fields: IntakeFieldConfig,
  template: IntakeTemplate | null | undefined,
  industry?: Industry | string | null
): LeadCaptureSummary {
  const templateId = resolveEffectiveIntakeTemplate(template, industry)
  const meta: IntakeTemplateMeta = getIntakeTemplateMeta(templateId)
  const required: string[] = []
  const optional: string[] = []

  for (const key of Object.keys(fields) as (keyof IntakeFieldConfig)[]) {
    const cfg = fields[key]
    if (!cfg?.enabled) continue
    const label = INTAKE_FIELD_LABELS[key]
    if (cfg.required) required.push(label)
    else optional.push(label)
  }

  // Reason for call is always collected by the flow even without a dedicated toggle.
  if (!required.includes("Reason for call") && !optional.includes("Reason for call")) {
    required.unshift("Reason for call")
  }

  const industryExtras = meta.industryFields.filter(
    (f) =>
      !required.some((r) => r.toLowerCase() === f.toLowerCase()) &&
      !optional.some((o) => o.toLowerCase() === f.toLowerCase())
  )

  const parts: string[] = []
  if (required.length) parts.push(`Required: ${required.join(", ")}`)
  if (optional.length) parts.push(`Optional: ${optional.join(", ")}`)
  if (industryExtras.length) parts.push(`${meta.label} extras: ${industryExtras.join(", ")}`)

  return {
    required,
    optional,
    industryExtras,
    sampleSteps: meta.sampleSteps,
    templateLabel: meta.label,
    templateId,
    previewLine: parts.join(" · ") || "Name, phone, and reason for the call",
  }
}

/**
 * Prompt block appended to dedicated-agent sync so field toggles and template
 * guidance match what Settings shows (same idea as template agents' Intake Rules).
 */
export function buildDedicatedIntakeGuidance(
  fields: IntakeFieldConfig,
  template: IntakeTemplate | null | undefined,
  industry?: Industry | string | null
): string {
  const summary = buildLeadCaptureSummary(fields, template, industry)
  const required = summary.required.join("; ") || "caller name; callback number; reason for call"
  const optional = summary.optional.length
    ? `Optional when volunteered or relevant: ${summary.optional.join("; ")}.`
    : "Skip optional fields unless the caller offers them or they are needed for a useful callback."
  const extras = summary.industryExtras.length
    ? `Also collect for ${summary.templateLabel}: ${summary.industryExtras.join("; ")}.`
    : ""
  const templateGuidance = buildIntakeTemplateGuidance(summary.templateId)

  return `## Lead capture (from Settings → What we capture)
- Required fields: ${required}.
- ${optional}
- ${extras}
- Industry guidance: ${templateGuidance}
- Prefer the callback number the caller confirms; if they say to use the number they are calling from, that is fine.
- Put each detail in the correct field (do not put a phone number in the name field, or an address in the reason).`
}
