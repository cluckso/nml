import { PlanType } from "@prisma/client"

/** Customer-facing tier names — volume & scale for service businesses. */
export const PLAN_SOLO_OWNER = "Solo Owner"
export const PLAN_MID_VOLUME = "Mid Volume"
export const PLAN_HIGH_VOLUME = "High Volume"

/** External-facing plan names. Internal enums stay STARTER / PRO / ELITE. */
export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  [PlanType.STARTER]: PLAN_SOLO_OWNER,
  [PlanType.PRO]: PLAN_MID_VOLUME,
  [PlanType.LOCAL_PLUS]: PLAN_HIGH_VOLUME,
  [PlanType.ELITE]: PLAN_HIGH_VOLUME,
}

/** Map pricing card keys to plan types (includes legacy keys for old links). */
export const PLAN_TYPE_BY_DISPLAY_KEY: Record<string, PlanType> = {
  [PLAN_SOLO_OWNER]: PlanType.STARTER,
  [PLAN_MID_VOLUME]: PlanType.PRO,
  [PLAN_HIGH_VOLUME]: PlanType.ELITE,
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
  if (requiredPlan === PlanType.STARTER) return PLAN_SOLO_OWNER
  if (requiredPlan === PlanType.PRO) return PLAN_MID_VOLUME
  return PLAN_HIGH_VOLUME
}

/** Marketing shorthand for mid- and top-tier features (booking, CRM, industry flows). */
export const MID_AND_HIGH_VOLUME_LABEL = `${PLAN_MID_VOLUME} and ${PLAN_HIGH_VOLUME}`

export type PricingTierKey =
  | typeof PLAN_SOLO_OWNER
  | typeof PLAN_MID_VOLUME
  | typeof PLAN_HIGH_VOLUME

export const PRICING_TIER_KEYS: PricingTierKey[] = [
  PLAN_SOLO_OWNER,
  PLAN_MID_VOLUME,
  PLAN_HIGH_VOLUME,
]

/** Short volume tag shown in settings sidebar group headers. */
export const PLAN_VOLUME_TAGS: Record<"starter" | "pro" | "local_plus", string> = {
  starter: "Low volume",
  pro: "Growing sales",
  local_plus: "Premium",
}
