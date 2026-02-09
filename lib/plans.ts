import { PlanType } from "@prisma/client"

/** Included call minutes per plan per month */
export const INCLUDED_MINUTES: Record<PlanType, number> = {
  [PlanType.STARTER]: 300,
  [PlanType.PRO]: 900,
  [PlanType.LOCAL_PLUS]: 1800,
}

/** One-time setup fee per plan (USD) — no setup fees */
export const SETUP_FEES: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.PRO]: 0,
  [PlanType.LOCAL_PLUS]: 0,
}

/** Free trial: call minutes cap before first paid subscription */
export const FREE_TRIAL_MINUTES = 50

/** Free trial: validity window in days (trial ends at 4 days or 50 minutes, whichever comes first) */
export const TRIAL_DAYS = 4

/** Monthly price per plan (USD) */
export const MONTHLY_PRICES: Record<PlanType, number> = {
  [PlanType.STARTER]: 99,
  [PlanType.PRO]: 229,
  [PlanType.LOCAL_PLUS]: 349,
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

/** Whether plan has industry-optimized / prebuilt agents (Pro+); user selects business type, system links prebuilt intake flow */
export function hasIndustryOptimizedAgents(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has appointment request capture (Pro+) */
export function hasAppointmentCapture(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan sends SMS confirmation to callers (Pro+) */
export function hasSmsToCallers(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has email/CRM forwarding (Pro+) */
export function hasCrmForwarding(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has lead tagging: emergency, estimate, follow-up (Pro+) */
export function hasLeadTagging(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has multi-department logic (removed from Local Plus; reserved for future) */
export function hasMultiDepartment(planType: PlanType): boolean {
  return false
}

/** Whether plan gets weekly usage & lead reports (Local Plus) */
export function hasWeeklyReports(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan has fully branded AI voice + voice sliders (Local Plus) */
export function hasBrandedVoice(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan shows urgency/emergency flags in dashboard (Pro+) */
export function hasUrgencyFlags(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has priority support (Local Plus; replaces multi-department & after-hours) */
export function hasPrioritySupport(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/**
 * In development, returns LOCAL_PLUS so all features are enabled for testing.
 * In production, returns the actual plan (or STARTER if none).
 */
export function getEffectivePlanType(planType: PlanType | null | undefined): PlanType {
  if (process.env.NODE_ENV === "development") {
    return PlanType.LOCAL_PLUS
  }
  return planType ?? PlanType.STARTER
}
