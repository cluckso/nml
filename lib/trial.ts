import { db } from "./db"
import { FREE_TRIAL_MINUTES } from "./plans"
import { isSubscriptionActive } from "./subscription"
import { normalizePhoneToE164 } from "./utils"

export type TrialStatus = {
  isOnTrial: boolean
  minutesUsed: number
  minutesRemaining: number
  isExhausted: boolean
  isExpired: boolean
  trialEndsAt: Date | null
  daysRemaining: number
}

/**
 * Returns trial status for a business. When trialStartedAt is set, uses
 * trialMinutesUsed and trialEndsAt; otherwise legacy behavior (Call aggregate, no expiry).
 */
export async function getTrialStatus(businessId: string): Promise<TrialStatus> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  })

  const hasActiveSubscription = isSubscriptionActive(business?.subscription)
  const isOnTrial = !hasActiveSubscription

  const now = new Date()

  if (!business) {
    return {
      isOnTrial: false,
      minutesUsed: 0,
      minutesRemaining: FREE_TRIAL_MINUTES,
      isExhausted: false,
      isExpired: false,
      trialEndsAt: null,
      daysRemaining: 0,
    }
  }

  const useTrialFields = business.trialStartedAt != null && business.trialEndsAt != null

  const minutesUsed = useTrialFields
    ? business.trialMinutesUsed
    : (await db.call.aggregate({ where: { businessId }, _sum: { minutes: true } }))._sum.minutes ?? 0
  const minutesRemaining = Math.max(0, FREE_TRIAL_MINUTES - minutesUsed)
  const isExhausted = isOnTrial && minutesRemaining <= 0
  const trialEndsAt = business.trialEndsAt ?? null
  const isExpired = isOnTrial && trialEndsAt != null && now > trialEndsAt
  const daysRemaining =
    trialEndsAt && now < trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      : 0

  return {
    isOnTrial,
    minutesUsed,
    minutesRemaining,
    isExhausted,
    isExpired,
    trialEndsAt,
    daysRemaining,
  }
}

export type TrialEligibilityResult =
  | { eligible: true; normalizedPhone: string }
  | { eligible: false; reason: "invalid_phone" | "phone_already_used_trial" }

/**
 * Check if a business phone is eligible for a new trial (one trial per phone).
 * Normalizes to E.164 and checks TrialClaim; if the number was already claimed,
 * returns ineligible. Does not check whether the current user already has a business.
 */
export async function checkTrialEligibility(
  businessPhone: string
): Promise<TrialEligibilityResult> {
  const normalized = normalizePhoneToE164(businessPhone)
  if (!normalized) return { eligible: false, reason: "invalid_phone" }

  const existing = await db.trialClaim.findUnique({
    where: { primaryForwardingNumber: normalized },
  })
  if (existing) return { eligible: false, reason: "phone_already_used_trial" }

  return { eligible: true, normalizedPhone: normalized }
}
