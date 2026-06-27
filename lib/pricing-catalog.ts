import { PlanType } from "@prisma/client"
import {
  INCLUDED_MINUTES,
  MONTHLY_PRICES,
  OVERAGE_RATE_PER_MIN,
  getIncludedMinutes,
  getMonthlyPrice,
} from "./plans"
import { PLAN_TYPE_BY_DISPLAY_KEY } from "./plan-labels"

export { OVERAGE_RATE_PER_MIN, getIncludedMinutes, getMonthlyPrice }

export type PricingTierKey = "Solo" | "Team" | "Pro"

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
}

/** Single source for pricing page, landing, and checkout cards. Amounts come from lib/plans.ts. */
export const PRICING_TIERS: PricingTier[] = [
  {
    key: "Solo",
    planType: PLAN_TYPE_BY_DISPLAY_KEY.Solo,
    name: "Solo",
    description: "For one-person shops — missed call capture and lead alerts",
    price: MONTHLY_PRICES[PlanType.STARTER],
    includedMinutes: INCLUDED_MINUTES[PlanType.STARTER],
    badge: "Best value",
    popular: false,
    subtitle: "Best for solo operators",
    features: [
      "Missed call capture",
      "Spam call filtering",
      "Name, phone & reason captured",
      "Email & SMS summaries",
      "No setup fee",
    ],
  },
  {
    key: "Team",
    planType: PLAN_TYPE_BY_DISPLAY_KEY.Team,
    name: "Team",
    description: "For growing shops — 24/7 answering, booking, and follow-up",
    price: MONTHLY_PRICES[PlanType.PRO],
    includedMinutes: INCLUDED_MINUTES[PlanType.PRO],
    badge: "Most popular",
    popular: true,
    subtitle: "Best for growing teams",
    features: [
      "24/7 call answering",
      "Industry intake flows",
      "Appointment & emergency logic",
      "SMS follow-up to callers",
      "CRM email forwarding",
      "Lead tagging",
    ],
  },
  {
    key: "Pro",
    planType: PLAN_TYPE_BY_DISPLAY_KEY.Pro,
    name: "Pro",
    description: "For high-volume and multi-location trades",
    price: MONTHLY_PRICES[PlanType.ELITE],
    includedMinutes: INCLUDED_MINUTES[PlanType.ELITE],
    popular: false,
    subtitle: "Best for high call volume",
    features: [
      "Premium branded voice",
      "Multi-department routing",
      "After-hours emergency handling",
      "Weekly usage & lead reports",
      "Advanced call handling controls",
      "Priority support",
    ],
  },
]

export const PRICING_TIERS_BY_KEY: Record<PricingTierKey, PricingTier> = Object.fromEntries(
  PRICING_TIERS.map((t) => [t.key, t])
) as Record<PricingTierKey, PricingTier>

/** For meta tags and hero copy — e.g. "Solo $99, Team $159, Pro $279/mo" */
export function formatPricingSummary(): string {
  const solo = PRICING_TIERS_BY_KEY.Solo
  const team = PRICING_TIERS_BY_KEY.Team
  const pro = PRICING_TIERS_BY_KEY.Pro
  return `Solo $${solo.price}, Team $${team.price}, Pro $${pro.price}/mo`
}

export function formatOverageRate(): string {
  return `$${OVERAGE_RATE_PER_MIN.toFixed(2)}/min`
}

/** Average captured job value for ROI marketing (USD). */
export const AVG_JOB_VALUE_LOW = 350
export const AVG_JOB_VALUE_HIGH = 600

export function formatJobRoiLine(): string {
  return `Average job: $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH}. One captured lead pays for months of service.`
}
