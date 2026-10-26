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
      "Lead insurance for one-truck shops — capture jobs when you can't answer, with trade-tuned intake and a text you can tap to call back.",
    price: MONTHLY_PRICES[PlanType.STARTER],
    includedMinutes: INCLUDED_MINUTES[PlanType.STARTER],
    badge: BASIC_BADGE,
    popular: true,
    subtitle: "One-truck shops · best to start",
    usageNote: "Same product — included minutes sized for most one-truck shops",
    features: [
      "Job capture when you can't answer",
      "Trade-tuned intake scripts (plumbing, HVAC, electrical, auto, etc.)",
      "Spam call filtering",
      "Name, phone, job, urgency, preferred time",
      "Lead alerts by email & SMS",
      "Text-back confirmation to callers",
      "No setup fee",
    ],
  },
  {
    key: PLAN_GROWTH,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_GROWTH],
    name: PLAN_GROWTH,
    description:
      "More minutes and tools for growing crews — appointments, follow-ups, and CRM delivery so leads land where you already work.",
    price: MONTHLY_PRICES[PlanType.PRO],
    includedMinutes: INCLUDED_MINUTES[PlanType.PRO],
    badge: "Growing shops",
    popular: false,
    subtitle: "Growing crew · appointments & CRM",
    usageNote: "Appointments, follow-ups, and CRM — plus more included minutes",
    features: [
      "Everything in Basic",
      "More included call minutes",
      "Appointment & emergency handling",
      "Follow-up texts to callers after capture",
      "CRM email forwarding / webhook",
      "Lead tagging and priority rules",
    ],
  },
  {
    key: PLAN_PLATINUM,
    planType: PLAN_TYPE_BY_DISPLAY_KEY[PLAN_PLATINUM],
    name: PLAN_PLATINUM,
    description:
      "High volume for busy multi-crew shops — branded scripting, department routing, and controls that keep paying jobs from walking.",
    price: MONTHLY_PRICES[PlanType.ELITE],
    includedMinutes: INCLUDED_MINUTES[PlanType.ELITE],
    badge: "For busy shops",
    popular: false,
    subtitle: "Multi-crew · high call volume",
    usageNote: "Highest included minutes for multi-crew volume",
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
