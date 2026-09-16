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
import { BASIC_BADGE } from "./marketing/positioning"

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
  badge?: "Lead insurance" | "Best to start" | "Most popular" | "Full coverage" | "Growing shops" | "For busy shops"
  popular: boolean
  features: string[]
  /** Short subtitle under plan name on landing */
  subtitle: string
  /** One-line guidance on who this tier fits (shown on pricing cards) */
  usageNote: string
}

/** Typical human answering-service entry price — for comparison copy only. */
export const HUMAN_RECEPTIONIST_FROM_MONTHLY = 235

/** Single source for pricing page, landing, and checkout cards. Amounts come from lib/plans.ts. */
export const PRICING_TIERS: PricingTier[] = [
  {
    key: PLAN_BASIC,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_BASIC],
    name: PLAN_BASIC,
    description:
      "Lead insurance for one-truck shops — grab missed and after-hours jobs when you're on a call or closed, without paying for a full front desk.",
    price: MONTHLY_PRICES[PlanType.STARTER],
    includedMinutes: INCLUDED_MINUTES[PlanType.STARTER],
    badge: BASIC_BADGE,
    popular: true,
    subtitle: "Overflow · nights · weekends",
    usageNote: "Hero plan for most shops — covers the calls you miss, not every ring all day",
    features: [
      "Missed & after-hours job capture",
      "Spam call filtering",
      "Name, phone, job, urgency, preferred time",
      "Lead alerts by email & SMS",
      "Trade-ready lead capture",
      "No setup fee",
    ],
  },
  {
    key: PLAN_GROWTH,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_GROWTH],
    name: PLAN_GROWTH,
    description:
      "Full front desk when you're ready — capture most inbound calls 24/7 so growing crews never lose a lead to a missed ring.",
    price: MONTHLY_PRICES[PlanType.PRO],
    includedMinutes: INCLUDED_MINUTES[PlanType.PRO],
    badge: "Full coverage",
    popular: false,
    subtitle: "Growing crew · steady inbound volume",
    usageNote: "When you want every inbound call captured, not just overflow",
    features: [
      "Everything in Basic",
      "24/7 inbound lead capture",
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
      "Full front desk for busy multi-crew shops — high volume, branded scripting, and routing that can't drop a paying job.",
    price: MONTHLY_PRICES[PlanType.ELITE],
    includedMinutes: INCLUDED_MINUTES[PlanType.ELITE],
    badge: "For busy shops",
    popular: false,
    subtitle: "Multi-crew · high call volume",
    usageNote: "For operations capturing every line throughout the day",
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
  return `${PLAN_BASIC} lead insurance from $${basic.price}/mo · one captured job pays for months`
}

export function formatOverageRate(): string {
  return `$${OVERAGE_RATE_PER_MIN.toFixed(2)}/min`
}

/**
 * Soft dollar anchors for ROI math (dashboard reports, internal estimates).
 * Prefer rhetorical prompts on marketing surfaces — owners supply their own number.
 */
export const AVG_JOB_VALUE_LOW = 350
export const AVG_JOB_VALUE_HIGH = 600

/** Emotional / homepage: invite the owner to name their own job value. */
export function formatJobValuePromptLine(): string {
  return `How much is a job worth to your business — $300? $500? $600+?`
}

/** Pricing / ROI close: rhetorical prompt + payback. */
export function formatJobRoiLine(): string {
  return `${formatJobValuePromptLine()} Capture one you'd have lost and CallGrabbr pays for itself for months.`
}

export function formatRoiHeadline(): string {
  return "One captured job pays for months of service"
}

export function formatMissedJobCostLine(): string {
  return `What does a missed emergency cost you — a few hundred? A half-day of work? Often enough to cover months of CallGrabbr.`
}

/** @deprecated Prefer formatJobValuePromptLine on marketing pages. Kept for dashboard estimates. */
export function formatAvgJobValueRange(): string {
  return `$${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH}`
}

export function formatVsHumanLine(): string {
  const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
  return `Less than 40% of a human answering service (from $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo) · ${PLAN_BASIC} from $${basic.price}/mo`
}

/** Re-export for pricing UI */
export { formatIncludedUsageShort, formatIncludedUsagePrimary, formatCostPerCapturedCall, approxCallsPerMonth }
