import { Industry } from "@prisma/client"
import { AGENT_PROMPT_CONFIG } from "../config/agent-prompt"

export type BusinessHoursInput = {
  open?: string
  close?: string
  days?: string[]
} | null

/**
 * Builds the agent global prompt from owner-editable config (config/agent-prompt.ts)
 * plus business data. Users never edit the prompt text — only you (owner) edit config/agent-prompt.ts.
 */
export function generatePrompt(
  businessName: string,
  industry: Industry,
  serviceAreas: string[],
  options?: {
    businessHours?: BusinessHoursInput
    departments?: string[]
    afterHoursEmergencyPhone?: string
    includeAppointmentCapture?: boolean
  }
): string {
  const cfg = AGENT_PROMPT_CONFIG
  const basePrompt = cfg.basePromptTemplate
    .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
    .replace(/\{\{SERVICE_AREAS\}\}/g, serviceAreas.join(", "))

  const businessHoursBlock = formatBusinessHoursBlock(options?.businessHours, options?.afterHoursEmergencyPhone)
  const departmentsBlock =
    options?.departments?.length
      ? cfg.departmentsBlockTemplate.replace(/\{\{DEPARTMENTS\}\}/g, options.departments.join(", "))
      : ""
  const appointmentBlock = options?.includeAppointmentCapture ? cfg.appointmentBlockTemplate : ""
  const tagBlock = cfg.tagBlockTemplate
  const industrySpecific = getIndustrySpecificPrompt(industry)

  return `${basePrompt}${businessHoursBlock}${departmentsBlock}${appointmentBlock}${tagBlock}\n\n${industrySpecific}`
}

function formatBusinessHoursBlock(businessHours?: BusinessHoursInput, afterHoursEmergencyPhone?: string): string {
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

function getIndustrySpecificPrompt(industry: Industry): string {
  const cfg = AGENT_PROMPT_CONFIG
  return cfg.industryPrompts[industry] ?? cfg.industryPrompts.GENERIC
}
