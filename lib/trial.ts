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
 * Returns trial status for a business. Uses trialMinutesUsed and trialEndsAt;
 * trial minutes are only incremented when trialStartedAt is set (webhook).
 */
export async function getTrialStatus(businessId: string): Promise<TrialStatus> {
  const business = await db.business.findUnique({
    where: { id: businessId },
  })

  const hasActiveSubscription = isSubscriptionActive(business)
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

  const minutesUsed = business.trialMinutesUsed ?? 0
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

/** Owner/dev numbers allowed to start multiple free trials (E.164). */
const DEFAULT_MULTI_TRIAL_PHONES = ["+16086421459"]

function getMultiTrialPhones(): Set<string> {
  const fromEnv =
    process.env.MULTI_TRIAL_PHONE_NUMBERS?.split(",")
      .map((value) => normalizePhoneToE164(value.trim()))
      .filter((value): value is string => !!value) ?? []
  return new Set([...DEFAULT_MULTI_TRIAL_PHONES, ...fromEnv])
}

export function isMultiTrialPhone(normalizedPhone: string): boolean {
  return getMultiTrialPhones().has(normalizedPhone)
}

/**
 * For allowlisted numbers, clear primaryForwardingNumber on other businesses so a new
 * trial account can claim the same forwarding line (unique constraint).
 */
export async function releasePrimaryForwardingNumberFromOtherBusinesses(
  normalizedPhone: string,
  exceptBusinessId?: string
): Promise<void> {
  if (!isMultiTrialPhone(normalizedPhone)) return

  const others = await db.business.findMany({
    where: {
      primaryForwardingNumber: normalizedPhone,
      ...(exceptBusinessId ? { id: { not: exceptBusinessId } } : {}),
    },
    select: { id: true },
  })

  for (const business of others) {
    await db.business.update({
      where: { id: business.id },
      data: { primaryForwardingNumber: `released-${business.id}` },
    })
  }
}

/**
 * Check if a business phone is eligible for a new trial (one trial per phone).
 * Normalizes to E.164 and checks Business.primaryForwardingNumber (unique);
 * if any business already has this number, returns ineligible.
 */
export async function checkTrialEligibility(
  businessPhone: string
): Promise<TrialEligibilityResult> {
  const normalized = normalizePhoneToE164(businessPhone)
  if (!normalized) return { eligible: false, reason: "invalid_phone" }

  if (isMultiTrialPhone(normalized)) {
    return { eligible: true, normalizedPhone: normalized }
  }

  const existing = await db.business.findUnique({
    where: { primaryForwardingNumber: normalized },
  })
  if (existing) return { eligible: false, reason: "phone_already_used_trial" }

  return { eligible: true, normalizedPhone: normalized }
}
