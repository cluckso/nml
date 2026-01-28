import { Industry } from "@prisma/client"

export type BusinessHoursInput = {
  open?: string
  close?: string
  days?: string[]
} | null

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
  const basePrompt = `You are a professional and friendly AI voice assistant for ${businessName}. Callers should hear a smile in your voice, so speak clearly and with a little enthusiasm. Your role is to:
- Greet callers warmly and professionally
- Collect necessary information about service requests
- Verify service area coverage
- Gather contact information
- Provide clear next steps

Always be:
- Polite and professional
- Concise but thorough
- Patient with callers
- Clear in your instructions

NEVER:
- Give pricing information
- Promise availability or scheduling
- Collect payment information
- Use fillers like "um" "uh" "well" "so"

If given information that should be a 911 call, pronounce "911" as "Nine-One-One", NOT "Nine hundred eleven"

Supported service areas: ${serviceAreas.join(", ")}`

  const businessHoursBlock = formatBusinessHoursBlock(options?.businessHours, options?.afterHoursEmergencyPhone)
  const departmentsBlock = options?.departments?.length
    ? `\n\nMulti-department: We have these departments: ${options.departments.join(", ")}. At the start of the call, ask which department they need and record it (use variable "department").`
    : ""
  const appointmentBlock = options?.includeAppointmentCapture
    ? `\n\nBefore ending the call, ask if they need an appointment. If yes, ask for preferred day(s) and time of day (e.g. morning/afternoon) and record as appointment_preference.`
    : ""

  const industrySpecific = getIndustrySpecificPrompt(industry)
  const tagBlock = `\n\nLead tagging: Classify the call as one of: emergency (urgent, safety), estimate (want a quote), follow-up (existing job or callback), or general. Record as lead_tag.`

  return `${basePrompt}${businessHoursBlock}${departmentsBlock}${appointmentBlock}${tagBlock}\n\n${industrySpecific}`
}

function formatBusinessHoursBlock(businessHours?: BusinessHoursInput, afterHoursEmergencyPhone?: string): string {
  if (!businessHours?.open || !businessHours?.close || !businessHours?.days?.length) {
    return "\n\nBusiness hours: Not set. Treat as always open for intake."
  }
  const days = businessHours.days.join(", ")
  const emergencyNote = afterHoursEmergencyPhone
    ? " If the caller indicates an emergency and we're closed, say we'll have someone call them back as soon as possible and that their request is being prioritized."
    : ""
  return `\n\nBusiness hours: We are open ${days} from ${businessHours.open} to ${businessHours.close}. If the current time is outside these hours, say "We're currently closed, but I'll take your information and someone will get back to you." Then proceed to collect their name, phone, and reason for calling.${emergencyNote}`
}

function getIndustrySpecificPrompt(industry: Industry): string {
  switch (industry) {
    case Industry.HVAC:
    case Industry.PLUMBING:
      return `Industry-specific instructions:
- Detect emergencies: "flooding", "no heat", "gas smell", "burst pipe", "no water", "frozen pipes"
- Flag emergencies immediately
- Ask about urgency level
- Collect service address
- Note any safety concerns`

    case Industry.AUTO_REPAIR:
      return `Industry-specific instructions:
- Handle appointment requests
- Answer repair status inquiries
- Collect vehicle information
- Note drop-off/pickup preferences
- Ask about warranty or estimate needs`

    case Industry.CHILDCARE:
      return `Industry-specific instructions:
- Handle enrollment inquiries
- Answer availability questions
- Collect age range information
- Schedule tour requests
- Note parent contact preferences`

    case Industry.ELECTRICIAN:
      return `Industry-specific instructions:
- Detect emergencies: "sparks", "smoke", "no power", "electrical fire"
- Flag emergencies immediately
- Ask about safety concerns
- Collect service address
- Note urgency level`

    default:
      return `Industry-specific instructions:
- Collect service request details
- Note urgency if mentioned
- Gather all relevant information`
  }
}
