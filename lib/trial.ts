import { db } from "./db"
import { FREE_TRIAL_MINUTES } from "./plans"

export type TrialStatus = {
  isOnTrial: boolean
  minutesUsed: number
  minutesRemaining: number
  isExhausted: boolean
}

/**
 * Returns trial status for a business: no active subscription = on trial.
 * Trial minutes = sum of all Call minutes for this business (no billing period).
 */
export async function getTrialStatus(businessId: string): Promise<TrialStatus> {
  const [business, totalMinutes] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    }),
    db.call.aggregate({
      where: { businessId },
      _sum: { minutes: true },
    }),
  ])

  const hasActiveSubscription =
    business?.subscription?.status === "ACTIVE"
  const minutesUsed = totalMinutes._sum.minutes ?? 0
  const minutesRemaining = Math.max(0, FREE_TRIAL_MINUTES - minutesUsed)
  const isOnTrial = !hasActiveSubscription
  const isExhausted = isOnTrial && minutesRemaining <= 0

  return {
    isOnTrial,
    minutesUsed,
    minutesRemaining,
    isExhausted,
  }
}
