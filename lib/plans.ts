import { PlanType } from "@prisma/client"

/** Pro or Elite tier (Elite includes LOCAL_PLUS for legacy). */
function isProOrElite(planType: PlanType | null | undefined): boolean {
  return planType === PlanType.PRO || planType === PlanType.ELITE || planType === PlanType.LOCAL_PLUS
}

/** Elite tier only (custom scripts, multi-location, reporting). */
function isEliteTier(planType: PlanType | null | undefined): boolean {
  return planType === PlanType.ELITE || planType === PlanType.LOCAL_PLUS
}

/** Included call minutes per plan per month */
export const INCLUDED_MINUTES: Record<PlanType, number> = {
  [PlanType.STARTER]: 300,
  [PlanType.PRO]: 900,
  [PlanType.LOCAL_PLUS]: 1800,
  [PlanType.ELITE]: 1800,
}

/** One-time setup fee per plan (USD) — no setup fees */
export const SETUP_FEES: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.PRO]: 0,
  [PlanType.LOCAL_PLUS]: 0,
  [PlanType.ELITE]: 0,
}

/** Free trial: call minutes cap before first paid subscription */
export const FREE_TRIAL_MINUTES = 50

/** Free trial: validity window in days (trial ends at 4 days or 50 minutes, whichever comes first) */
export const TRIAL_DAYS = 4

/** Monthly price per plan (USD) — Starter $99, Pro $149, Elite $249 */
export const MONTHLY_PRICES: Record<PlanType, number> = {
  [PlanType.STARTER]: 99,
  [PlanType.PRO]: 149,
  [PlanType.LOCAL_PLUS]: 249,
  [PlanType.ELITE]: 249,
}

/** Overage rate per minute (USD) */
export const OVERAGE_RATE_PER_MIN = 0.2

/** Max call duration (seconds) we accept from webhooks; longer calls are clamped to prevent abuse. */
export const MAX_CALL_DURATION_SECONDS = 24 * 60 * 60 // 24 hours

/**
 * Convert raw call duration to billable minutes. Used for trial and plan usage.
 * Rules: round up to whole minutes; minimum 1 minute per call (industry standard).
 */
export function toBillableMinutes(durationSeconds: number): number {
  const clamped = Math.max(0, Math.min(MAX_CALL_DURATION_SECONDS, durationSeconds))
  const rawMinutes = clamped / 60
  return Math.max(1, Math.ceil(rawMinutes))
}

export function getIncludedMinutes(planType: PlanType): number {
  return INCLUDED_MINUTES[planType] ?? 0
}

export function getOverageMinutes(planType: PlanType, minutesUsed: number): number {
  return Math.max(0, minutesUsed - getIncludedMinutes(planType))
}

/** Whether plan has industry-optimized / prebuilt agents (Pro+) */
export function hasIndustryOptimizedAgents(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan has appointment booking (Pro+) */
export function hasAppointmentCapture(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan sends SMS follow-up to callers (Pro+) */
export function hasSmsToCallers(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan has CRM / email export (Pro+) */
export function hasCrmForwarding(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan has lead tagging (Pro+) */
export function hasLeadTagging(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan has multi-location (Elite) */
export function hasMultiDepartment(planType: PlanType): boolean {
  return isEliteTier(planType)
}

/** Whether plan gets weekly usage & lead reports — reporting dashboard (Elite) */
export function hasWeeklyReports(planType: PlanType): boolean {
  return isEliteTier(planType)
}

/** Whether plan has custom scripts / voice branding (Elite) */
export function hasBrandedVoice(planType: PlanType): boolean {
  return isEliteTier(planType)
}

/** Whether plan shows urgency/emergency flags in dashboard (Pro+) */
export function hasUrgencyFlags(planType: PlanType): boolean {
  return isProOrElite(planType)
}

/** Whether plan has priority support (Elite) */
export function hasPrioritySupport(planType: PlanType): boolean {
  return isEliteTier(planType)
}

/**
 * In development, returns ELITE so all features are enabled for testing.
 * In production, returns the actual plan (or STARTER if none). LOCAL_PLUS is treated as ELITE for display.
 */
export function getEffectivePlanType(planType: PlanType | null | undefined): PlanType {
  if (process.env.NODE_ENV === "development") {
    return PlanType.ELITE
  }
  if (planType === PlanType.LOCAL_PLUS) return PlanType.ELITE
  return planType ?? PlanType.STARTER
}
