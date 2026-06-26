import { PlanType } from "@prisma/client"

/** External-facing plan names (customer-facing). Internal enums stay STARTER/PRO/ELITE. */
export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  [PlanType.STARTER]: "Solo",
  [PlanType.PRO]: "Team",
  [PlanType.LOCAL_PLUS]: "Pro",
  [PlanType.ELITE]: "Pro",
}

/** Map display name keys used in pricing components to plan types */
export const PLAN_TYPE_BY_DISPLAY_KEY: Record<string, PlanType> = {
  Solo: PlanType.STARTER,
  Team: PlanType.PRO,
  Pro: PlanType.ELITE,
}

export function getPlanDisplayName(planType: PlanType | null | undefined): string {
  if (!planType) return "No plan"
  return PLAN_DISPLAY_NAMES[planType] ?? planType
}

/** Tier label for upgrade prompts (Team = mid tier, Pro = top tier) */
export function getUpgradeTierLabel(requiredPlan: PlanType): string {
  if (requiredPlan === PlanType.PRO) return "Team"
  return "Pro"
}
