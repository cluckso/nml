import { PlanType } from "@prisma/client"
import {
  INCLUDED_MINUTES,
  MONTHLY_PRICES,
  OVERAGE_RATE_PER_MIN,
  getIncludedMinutes,
  getMonthlyPrice,
} from "./plans"
import {
  PLAN_HIGH_VOLUME,
  PLAN_MID_VOLUME,
  PLAN_SOLO_OWNER,
  PLAN_TYPE_BY_DISPLAY_KEY,
  type PricingTierKey,
} from "./plan-labels"
import { formatIncludedUsageShort } from "./plan-usage"

export { OVERAGE_RATE_PER_MIN, getIncludedMinutes, getMonthlyPrice }
export type { PricingTierKey }

export interface PricingTier {
  key: PricingTierKey
  planType: PlanType
  name: string
  description: string
  price: number
  includedMinutes: number
  /** Shown on plan card when set */
  badge?: "Best value" | "Most popular"
  popular: boolean
  features: string[]
  /** Short subtitle under plan name on landing */
  subtitle: string
  /** One-line guidance on who this tier fits (shown on pricing cards) */
  usageNote: string
}

/** Single source for pricing page, landing, and checkout cards. Amounts come from lib/plans.ts. */
export const PRICING_TIERS: PricingTier[] = [
  {
    key: PLAN_SOLO_OWNER,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_SOLO_OWNER],
    name: PLAN_SOLO_OWNER,
    description: "Missed and after-hours coverage for owner-operators and one-truck shops.",
    price: MONTHLY_PRICES[PlanType.STARTER],
    includedMinutes: INCLUDED_MINUTES[PlanType.STARTER],
    badge: "Best value",
    popular: false,
    subtitle: "Solo operator · one truck",
    usageNote: "Ideal when you're on a job or closed—not every call, all day",
    features: [
      "Missed call capture",
      "Spam call filtering",
      "Caller name, phone, and reason",
      "Email and SMS summaries",
      "No setup fee",
    ],
  },
  {
    key: PLAN_MID_VOLUME,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_MID_VOLUME],
    name: PLAN_MID_VOLUME,
    description: "Always-on answering for growing teams that can't afford to miss inbound calls.",
    price: MONTHLY_PRICES[PlanType.PRO],
    includedMinutes: INCLUDED_MINUTES[PlanType.PRO],
    badge: "Most popular",
    popular: true,
    subtitle: "Growing crew · steady inbound volume",
    usageNote: "Built for shops that answer most incoming calls",
    features: [
      "Everything in Solo Owner",
      "24/7 call answering",
      "Industry-specific intake flows",
      "Appointment and emergency handling",
      "SMS follow-up to callers",
      "CRM email forwarding",
      "Lead tagging and priority rules",
    ],
  },
  {
    key: PLAN_HIGH_VOLUME,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_HIGH_VOLUME],
    name: PLAN_HIGH_VOLUME,
    description: "Full coverage for busy shops, multiple crews, and high daily call volume.",
    price: MONTHLY_PRICES[PlanType.ELITE],
    includedMinutes: INCLUDED_MINUTES[PlanType.ELITE],
    popular: false,
    subtitle: "Multi-crew · high call volume",
    usageNote: "For operations answering every line throughout the day",
    features: [
      "Everything in Mid Volume",
      "Branded voice and scripting",
      "Multi-department routing",
      "After-hours emergency routing",
      "Weekly usage and lead reports",
      "Advanced call handling controls",
      "Priority support",
    ],
  },
]

export const PRICING_TIERS_BY_KEY: Record<PricingTierKey, PricingTier> = Object.fromEntries(
  PRICING_TIERS.map((t) => [t.key, t])
) as Record<PricingTierKey, PricingTier>

/** For meta tags and hero copy */
export function formatPricingSummary(): string {
  const solo = PRICING_TIERS_BY_KEY[PLAN_SOLO_OWNER]
  const mid = PRICING_TIERS_BY_KEY[PLAN_MID_VOLUME]
  const high = PRICING_TIERS_BY_KEY[PLAN_HIGH_VOLUME]
  return `${PLAN_SOLO_OWNER} from $${solo.price}/mo, ${PLAN_MID_VOLUME} $${mid.price}/mo, ${PLAN_HIGH_VOLUME} $${high.price}/mo`
}

export function formatOverageRate(): string {
  return `$${OVERAGE_RATE_PER_MIN.toFixed(2)}/min`
}

/** Average captured job value for ROI marketing (USD). */
export const AVG_JOB_VALUE_LOW = 350
export const AVG_JOB_VALUE_HIGH = 600

export function formatJobRoiLine(): string {
  return `Average job value: $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH}. One captured lead can cover months of service.`
}

/** Re-export for pricing UI */
export { formatIncludedUsageShort }
