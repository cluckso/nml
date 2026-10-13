import { Industry } from "@prisma/client"

export const INDUSTRIES = [
  { value: Industry.HVAC, label: "HVAC", description: "Heating, ventilation, and air conditioning" },
  { value: Industry.PLUMBING, label: "Plumbing", description: "Plumbing services" },
  { value: Industry.ELECTRICIAN, label: "Electrician", description: "Electrical services" },
  { value: Industry.HANDYMAN, label: "Handyman / Repairs", description: "General handyman and repairs" },
  { value: Industry.AUTO_REPAIR, label: "Auto Repair", description: "Automotive repair and maintenance" },
  { value: Industry.CHILDCARE, label: "Childcare", description: "Daycare, preschool, after-school programs" },
  { value: Industry.GENERIC, label: "Other", description: "Other service business — uses the default service number" },
] as const

/**
 * True only for explicitly flagged complex setups (multi-location / custom scripts).
 * Multi-area service territories are self-serve — do not dead-end onboarding.
 */
export function isComplexSetup(data: {
  industry?: Industry
  serviceAreas?: string[]
  customScript?: boolean
  multiLocation?: boolean
}): boolean {
  if (data.multiLocation) return true
  if (data.customScript) return true
  return false
}
