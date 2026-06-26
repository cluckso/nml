import { Industry } from "@prisma/client"
import { PlanType } from "@prisma/client"
import { hasIndustryOptimizedAgents } from "./plans"

/**
 * Flow categories for UI: Basic = barebones only; Pro/Local Plus = choose from these.
 * Maps to Industry (+ offersRoadsideService for Automotive).
 */
export type FlowCategoryId = "barebones" | "home_service" | "automotive" | "childcare"

export interface FlowOption {
  id: FlowCategoryId
  label: string
  description: string
  /** Industry(ies) this flow maps to; for home_service we use subCategory */
  industry?: Industry
  /** Sub-options for home_service (HVAC, Plumber, etc.) or automotive (roadside vs not) */
  subOptions?: { value: string; label: string; industry?: Industry }[]
  /** Preview steps shown in UI */
  previewSteps: string[]
  /** Pro+ only; Basic sees this grayed out with upgrade link */
  requiresPro: boolean
}

export const FLOW_OPTIONS: FlowOption[] = [
  {
    id: "barebones",
    label: "Basic (name, number, reason)",
    description: "Minimal flow: caller name, phone number, and reason for call.",
    industry: Industry.GENERIC,
    previewSteps: [
      "Greet and ask for caller's name",
      "Ask for best phone number to reach them",
      "Ask what they're calling about",
      "Confirm details and thank them",
    ],
    requiresPro: false,
  },
  {
    id: "home_service",
    label: "Home Service",
    description: "Collects address and assesses urgency. For HVAC, plumbing, electrical, handyman.",
    previewSteps: [
      "Greet and get caller's name",
      "Verify service area (city)",
      "Collect full property address",
      "Describe the issue and assess urgency (emergency vs routine)",
      "Confirm details and next steps",
    ],
    requiresPro: true,
    subOptions: [
      { value: Industry.HVAC, label: "HVAC", industry: Industry.HVAC },
      { value: Industry.ELECTRICIAN, label: "Electrician", industry: Industry.ELECTRICIAN },
      { value: Industry.PLUMBING, label: "Plumber", industry: Industry.PLUMBING },
      { value: Industry.HANDYMAN, label: "Handyman / Repairs", industry: Industry.HANDYMAN },
    ],
  },
  {
    id: "automotive",
    label: "Automotive Service",
    description: "Collects year/make/model and appointment preference. Roadside option collects location.",
    previewSteps: [
      "Greet and get caller's name and phone",
      "Collect vehicle year, make, and model",
      "Reason for call (new issue, maintenance, status check, or scheduling)",
      "If scheduling: preferred days/times",
      "If roadside: current location",
      "Confirm details",
    ],
    industry: Industry.AUTO_REPAIR,
    requiresPro: true,
    subOptions: [
      { value: "roadside", label: "Offers roadside services (needs location)" },
      { value: "no_roadside", label: "Does not offer roadside services" },
    ],
  },
  {
    id: "childcare",
    label: "Childcare Service",
    description: "Parent name, contact, child age, type of care, tour preference.",
    industry: Industry.CHILDCARE,
    previewSteps: [
      "Greet and get parent's name and phone",
      "Child's age or age range",
      "Type of care (full-time, part-time, drop-in, etc.)",
      "Tour or visit preference if applicable",
      "Confirm details",
    ],
    requiresPro: true,
  },
]

export function getFlowOption(id: FlowCategoryId): FlowOption | undefined {
  return FLOW_OPTIONS.find((f) => f.id === id)
}

export function getFlowOptionsForPlan(planType: PlanType | null | undefined): {
  selectable: FlowOption[]
  locked: FlowOption[]
} {
  const canSelectProFlows = planType && hasIndustryOptimizedAgents(planType)
  const selectable = FLOW_OPTIONS.filter((f) => !f.requiresPro || canSelectProFlows)
  const locked = FLOW_OPTIONS.filter((f) => f.requiresPro && !canSelectProFlows)
  return { selectable, locked }
}

/** Map Industry to FlowCategoryId for display */
export function industryToFlowCategory(industry: Industry): FlowCategoryId {
  switch (industry) {
    case Industry.HVAC:
    case Industry.PLUMBING:
    case Industry.ELECTRICIAN:
    case Industry.HANDYMAN:
      return "home_service"
    case Industry.AUTO_REPAIR:
      return "automotive"
    case Industry.CHILDCARE:
      return "childcare"
    default:
      return "barebones"
  }
}
