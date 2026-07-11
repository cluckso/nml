import { PlanType } from "@prisma/client"
import {
  INCLUDED_MINUTES,
  MONTHLY_PRICES,
  OVERAGE_RATE_PER_MIN,
  getIncludedMinutes,
  getMonthlyPrice,
} from "./plans"
import {
  PLAN_BASIC,
  PLAN_GROWTH,
  PLAN_PLATINUM,
  PLAN_TYPE_BY_DISPLAY_KEY,
  type PricingTierKey,
} from "./plan-labels"
import {
  approxCallsPerMonth,
  formatCostPerCapturedCall,
  formatIncludedUsagePrimary,
  formatIncludedUsageShort,
} from "./plan-usage"

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
  badge?: "Best to start" | "Growing shops" | "For busy shops"
  popular: boolean
  features: string[]
  /** Short subtitle under plan name on landing */
  subtitle: string
  /** One-line guidance on who this tier fits (shown on pricing cards) */
  usageNote: string
}

/** Typical human virtual receptionist entry price — for comparison copy. */
export const HUMAN_RECEPTIONIST_FROM_MONTHLY = 235

/** Single source for pricing page, landing, and checkout cards. Amounts come from lib/plans.ts. */
export const PRICING_TIERS: PricingTier[] = [
  {
    key: PLAN_BASIC,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_BASIC],
    name: PLAN_BASIC,
    description:
      "Catch missed and after-hours calls when you're on a job or the shop is closed — without hiring front-desk staff.",
    price: MONTHLY_PRICES[PlanType.STARTER],
    includedMinutes: INCLUDED_MINUTES[PlanType.STARTER],
    badge: "Best to start",
    popular: true,
    subtitle: "On the job · evenings · weekends",
    usageNote: "Most one-truck shops start here — covers the calls you miss, not every ring all day",
    features: [
      "Missed & after-hours call capture",
      "Spam call filtering",
      "Caller name, phone, and reason",
      "Lead alerts to you by email & SMS",
      "Service-business lead capture",
      "No setup fee",
    ],
  },
  {
    key: PLAN_GROWTH,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_GROWTH],
    name: PLAN_GROWTH,
    description:
      "Your 24/7 front desk — answer most inbound calls so growing crews never lose a lead to a missed ring.",
    price: MONTHLY_PRICES[PlanType.PRO],
    includedMinutes: INCLUDED_MINUTES[PlanType.PRO],
    badge: "Growing shops",
    popular: false,
    subtitle: "Growing crew · steady inbound volume",
    usageNote: "When you need every call answered, not just the ones you miss",
    features: [
      "Everything in Basic",
      "24/7 call answering",
      "Industry-specific intake flows",
      "Appointment & emergency handling",
      "Text callers back (confirmation & follow-up)",
      "CRM email forwarding",
      "Lead tagging and priority rules",
    ],
  },
  {
    key: PLAN_PLATINUM,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_PLATINUM],
    name: PLAN_PLATINUM,
    description:
      "Full coverage for busy shops, multiple crews, and operations that can't afford a single dropped call.",
    price: MONTHLY_PRICES[PlanType.ELITE],
    includedMinutes: INCLUDED_MINUTES[PlanType.ELITE],
    badge: "For busy shops",
    popular: false,
    subtitle: "Multi-crew · high call volume",
    usageNote: "For operations answering every line throughout the day",
    features: [
      "Everything in Growth",
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
  const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
  return `${PLAN_BASIC} from $${basic.price}/mo · one captured job pays for months`
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

export function formatRoiHeadline(): string {
  return "One captured job pays for months of service"
}

export function formatMissedJobCostLine(): string {
  return `One missed emergency job often runs $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH} — enough to cover months of CallGrabbr`
}

export function formatAvgJobValueRange(): string {
  return `$${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH}`
}

export function formatVsHumanLine(): string {
  const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
  return `Less than 40% of a human answering service (from $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo) · ${PLAN_BASIC} from $${basic.price}/mo`
}

/** Re-export for pricing UI */
export { formatIncludedUsageShort, formatIncludedUsagePrimary, formatCostPerCapturedCall, approxCallsPerMonth }
