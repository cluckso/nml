import { PlanType } from "@prisma/client"

/** Customer-facing tier names — Basic → Growth → Platinum. */
export const PLAN_BASIC = "Basic"
export const PLAN_GROWTH = "Growth"
export const PLAN_PLATINUM = "Platinum"

/** @deprecated Use PLAN_BASIC — kept for internal imports */
export const PLAN_SOLO_OWNER = PLAN_BASIC
/** @deprecated Use PLAN_GROWTH */
export const PLAN_MID_VOLUME = PLAN_GROWTH
/** @deprecated Use PLAN_PLATINUM */
export const PLAN_HIGH_VOLUME = PLAN_PLATINUM

/** External-facing plan names. Internal enums stay STARTER / PRO / ELITE. */
export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  [PlanType.STARTER]: PLAN_BASIC,
  [PlanType.PRO]: PLAN_GROWTH,
  [PlanType.LOCAL_PLUS]: PLAN_PLATINUM,
  [PlanType.ELITE]: PLAN_PLATINUM,
}

/** Map pricing card keys to plan types (includes legacy keys for old links). */
export const PLAN_TYPE_BY_DISPLAY_KEY: Record<string, PlanType> = {
  [PLAN_BASIC]: PlanType.STARTER,
  [PLAN_GROWTH]: PlanType.PRO,
  [PLAN_PLATINUM]: PlanType.ELITE,
  // Legacy display names
  "Solo Owner": PlanType.STARTER,
  "Mid Volume": PlanType.PRO,
  "High Volume": PlanType.ELITE,
  Solo: PlanType.STARTER,
  Team: PlanType.PRO,
  Pro: PlanType.ELITE,
  Operator: PlanType.STARTER,
  Professional: PlanType.PRO,
  Business: PlanType.ELITE,
}

export function getPlanDisplayName(planType: PlanType | null | undefined): string {
  if (!planType) return "No plan"
  return PLAN_DISPLAY_NAMES[planType] ?? planType
}

/** Minimum tier label for upgrade prompts in settings and billing. */
export function getUpgradeTierLabel(requiredPlan: PlanType): string {
  if (requiredPlan === PlanType.STARTER) return PLAN_BASIC
  if (requiredPlan === PlanType.PRO) return PLAN_GROWTH
  return PLAN_PLATINUM
}

/** Marketing shorthand for Growth and Platinum features (booking, CRM, industry flows). */
export const GROWTH_AND_PLATINUM_LABEL = `${PLAN_GROWTH} and ${PLAN_PLATINUM}`

/** @deprecated Use GROWTH_AND_PLATINUM_LABEL */
export const MID_AND_HIGH_VOLUME_LABEL = GROWTH_AND_PLATINUM_LABEL

export type PricingTierKey = typeof PLAN_BASIC | typeof PLAN_GROWTH | typeof PLAN_PLATINUM

export const PRICING_TIER_KEYS: PricingTierKey[] = [PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM]

/** Short volume tag shown in settings sidebar group headers. */
export const PLAN_VOLUME_TAGS: Record<"starter" | "pro" | "local_plus", string> = {
  starter: "Basic",
  pro: "Growth",
  local_plus: "Platinum",
}
