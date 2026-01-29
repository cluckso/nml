import { PlanType } from "@prisma/client"

/** Included call minutes per plan per month */
export const INCLUDED_MINUTES: Record<PlanType, number> = {
  [PlanType.STARTER]: 500,
  [PlanType.PRO]: 1200,
  [PlanType.LOCAL_PLUS]: 2500,
}

/** One-time setup fee per plan (USD) — no setup fees */
export const SETUP_FEES: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.PRO]: 0,
  [PlanType.LOCAL_PLUS]: 0,
}

/** Free trial: included call minutes for all plans before first paid subscription */
export const FREE_TRIAL_MINUTES = 100

/** Monthly price per plan (USD) */
export const MONTHLY_PRICES: Record<PlanType, number> = {
  [PlanType.STARTER]: 99,
  [PlanType.PRO]: 199,
  [PlanType.LOCAL_PLUS]: 299,
}

/** Overage rate per minute (USD) */
export const OVERAGE_RATE_PER_MIN = 0.1

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

/** Whether plan has custom intake flows by service type (Pro+) */
export function hasCustomIntakeFlows(planType: PlanType): boolean {
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

/** Whether plan has lead tagging: emergency, estimate, follow-up (Pro+; full in Local Plus) */
export function hasLeadTagging(planType: PlanType): boolean {
  return planType === PlanType.PRO || planType === PlanType.LOCAL_PLUS
}

/** Whether plan has priority call routing (Local Plus) */
export function hasPriorityRouting(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan has multi-department logic (Local Plus) */
export function hasMultiDepartment(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan has after-hours emergency handling (Local Plus) */
export function hasAfterHoursEmergency(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan gets weekly usage & lead reports (Local Plus) */
export function hasWeeklyReports(planType: PlanType): boolean {
  return planType === PlanType.LOCAL_PLUS
}

/** Whether plan has fully branded AI voice (Local Plus) */
export function hasBrandedVoice(planType: PlanType): boolean {
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
