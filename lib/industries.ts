import { Industry } from "@prisma/client"

export const INDUSTRIES = [
  { value: Industry.HVAC, label: "HVAC", description: "Heating, ventilation, and air conditioning" },
  { value: Industry.PLUMBING, label: "Plumbing", description: "Plumbing services" },
  { value: Industry.ELECTRICIAN, label: "Electrician", description: "Electrical services" },
  { value: Industry.HANDYMAN, label: "Handyman / Repairs", description: "General handyman and repairs" },
  { value: Industry.AUTO_REPAIR, label: "Auto Repair", description: "Automotive repair and maintenance" },
  { value: Industry.CHILDCARE, label: "Childcare", description: "Daycare, preschool, after-school programs" },
  { value: Industry.GENERIC, label: "Other", description: "Other service business — uses the default AI number" },
] as const

export function isComplexSetup(data: {
  industry?: Industry
  serviceAreas?: string[]
  customScript?: boolean
  multiLocation?: boolean
}): boolean {
  // Multi-location requires manual setup
  if (data.multiLocation) return true
  
  // Custom scripts require manual setup
  if (data.customScript) return true
  
  // Multiple service areas might need review
  if (data.serviceAreas && data.serviceAreas.length > 3) return true
  
  return false
}
