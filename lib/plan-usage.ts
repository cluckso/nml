import { PlanType } from "@prisma/client"
import {
  getIncludedMinutes,
  getMonthlyPrice,
  getOverageMinutes,
  MONTHLY_PRICES,
  OVERAGE_RATE_PER_MIN,
} from "./plans"
import { getPlanDisplayName } from "./plan-labels"

/** Typical intake call length for marketing "~X calls/month" estimates. */
export const TYPICAL_INTAKE_CALL_MINUTES = 3

/** Show upgrade nudge when usage reaches this fraction of included minutes. */
export const USAGE_NUDGE_THRESHOLD = 0.8

const NEXT_PLAN: Partial<Record<PlanType, PlanType>> = {
  [PlanType.STARTER]: PlanType.PRO,
  [PlanType.PRO]: PlanType.ELITE,
  [PlanType.LOCAL_PLUS]: PlanType.ELITE,
}

export function approxCallsPerMonth(
  includedMinutes: number,
  avgMinutesPerCall: number = TYPICAL_INTAKE_CALL_MINUTES
): number {
  if (avgMinutesPerCall <= 0) return 0
  return Math.floor(includedMinutes / avgMinutesPerCall)
}

export function formatIncludedUsageLabel(includedMinutes: number): string {
  const calls = approxCallsPerMonth(includedMinutes)
  return `${includedMinutes.toLocaleString()} included min/mo (≈${calls} calls at ~${TYPICAL_INTAKE_CALL_MINUTES} min each)`
}

export function formatIncludedUsageShort(includedMinutes: number): string {
  const calls = approxCallsPerMonth(includedMinutes)
  return `≈${calls} calls/mo (~${TYPICAL_INTAKE_CALL_MINUTES} min each)`
}

export function getUsagePercent(minutesUsed: number, minutesIncluded: number): number {
  if (minutesIncluded <= 0) return 0
  return Math.min(100, (minutesUsed / minutesIncluded) * 100)
}

export function isUsageNudgeThreshold(minutesUsed: number, minutesIncluded: number): boolean {
  if (minutesIncluded <= 0) return false
  return minutesUsed >= minutesIncluded * USAGE_NUDGE_THRESHOLD
}

export function estimatedMonthlyBill(planType: PlanType, minutesUsed: number): number {
  const overage = getOverageMinutes(planType, minutesUsed) * OVERAGE_RATE_PER_MIN
  return getMonthlyPrice(planType) + overage
}

/** If upgrading would lower this month's bill at current usage, return that plan. */
export function getCheaperUpgradePlan(
  planType: PlanType,
  minutesUsed: number
): PlanType | null {
  const next = NEXT_PLAN[planType]
  if (!next) return null
  const currentCost = estimatedMonthlyBill(planType, minutesUsed)
  const nextCost = estimatedMonthlyBill(next, minutesUsed)
  if (nextCost < currentCost && minutesUsed <= getIncludedMinutes(next)) {
    return next
  }
  return null
}

export type PlanUsageNudge = {
  show: boolean
  severity: "info" | "warning"
  title: string
  message: string
  upgradePlan: PlanType | null
  upgradePlanName: string | null
  ctaLabel: string
  ctaHref: string
}

export function getPlanUsageNudge(input: {
  planType: PlanType | null
  minutesUsed: number
  minutesIncluded: number
  isOnTrial: boolean
}): PlanUsageNudge | null {
  const { planType, minutesUsed, minutesIncluded, isOnTrial } = input
  if (minutesIncluded <= 0) return null

  const percent = getUsagePercent(minutesUsed, minutesIncluded)
  const inOverage = minutesUsed > minutesIncluded
  const atThreshold = isUsageNudgeThreshold(minutesUsed, minutesIncluded)

  if (!atThreshold && !inOverage) return null

  const ctaHref = "/billing#plans"

  if (isOnTrial) {
    return {
      show: true,
      severity: atThreshold || inOverage ? "warning" : "info",
      title: inOverage ? "Trial minutes used up" : "Trial minutes running low",
      message: inOverage
        ? "Choose a plan to keep your call assistant live. Solo Owner covers missed and after-hours calls; Mid Volume is built for 24/7 answering."
        : `You've used ${Math.ceil(percent)}% of your trial minutes. Pick a plan before you run out so calls keep getting answered.`,
      upgradePlan: PlanType.PRO,
      upgradePlanName: getPlanDisplayName(PlanType.PRO),
      ctaLabel: "View plans",
      ctaHref,
    }
  }

  if (!planType) return null

  const upgradePlan = NEXT_PLAN[planType] ?? null
  const upgradePlanName = upgradePlan ? getPlanDisplayName(upgradePlan) : null
  const cheaperUpgrade = getCheaperUpgradePlan(planType, minutesUsed)
  const nextIncluded = upgradePlan ? getIncludedMinutes(upgradePlan) : 0
  const nextCalls = upgradePlan ? approxCallsPerMonth(nextIncluded) : 0

  if (inOverage) {
    const overageCost = getOverageMinutes(planType, minutesUsed) * OVERAGE_RATE_PER_MIN
    const savingsPlan = cheaperUpgrade
    const savingsName = savingsPlan ? getPlanDisplayName(savingsPlan) : upgradePlanName
    return {
      show: true,
      severity: "warning",
      title: "Included minutes exceeded",
      message: savingsPlan
        ? `You're in overage ($${overageCost.toFixed(2)} so far). At your current pace, ${savingsName} would cost less and includes ${nextIncluded.toLocaleString()} min (≈${nextCalls} calls).`
        : upgradePlan
          ? `You're in overage ($${overageCost.toFixed(2)} so far). ${upgradePlanName} includes ${nextIncluded.toLocaleString()} min (≈${nextCalls} calls) for shops answering most inbound calls.`
          : `You're in overage ($${overageCost.toFixed(2)} so far). Contact us if you need a higher allowance.`,
      upgradePlan: savingsPlan ?? upgradePlan,
      upgradePlanName: savingsName,
      ctaLabel: upgradePlan || savingsPlan ? `Upgrade to ${savingsName}` : "Contact support",
      ctaHref,
    }
  }

  // At 80%+ but not in overage yet
  const planName = getPlanDisplayName(planType)
  if (planType === PlanType.STARTER) {
    return {
      show: true,
      severity: "info",
      title: "You're approaching your minute limit",
      message: `${planName} fits missed and after-hours calls for most one-truck shops (≈${approxCallsPerMonth(minutesIncluded)} calls/mo). Answering every inbound call? ${upgradePlanName} is your 24/7 front desk with ${nextIncluded.toLocaleString()} min (≈${nextCalls} calls).`,
      upgradePlan,
      upgradePlanName,
      ctaLabel: `See ${upgradePlanName}`,
      ctaHref,
    }
  }

  if (planType === PlanType.PRO) {
    return {
      show: true,
      severity: "info",
      title: "You're approaching your minute limit",
      message: `You've used ${Math.ceil(percent)}% of your included minutes. ${upgradePlanName} adds ${nextIncluded.toLocaleString()} min (≈${nextCalls} calls) plus premium voice and multi-crew routing.`,
      upgradePlan,
      upgradePlanName,
      ctaLabel: `See ${upgradePlanName}`,
      ctaHref,
    }
  }

  return {
    show: true,
    severity: "info",
    title: "You're approaching your minute limit",
    message: `You've used ${Math.ceil(percent)}% of your ${planName} allowance. Overage is ${OVERAGE_RATE_PER_MIN.toFixed(2)}/min after included minutes.`,
    upgradePlan: null,
    upgradePlanName: null,
    ctaLabel: "View billing",
    ctaHref: "/billing",
  }
}
