import { ClientStatus, SubscriptionStatus } from "@prisma/client"
import { db } from "./db"
import { FREE_TRIAL_MINUTES } from "./plans"
import { releaseRetellNumber } from "./retell"

export type ExpireTrialsResult = {
  scanned: number
  expired: number
  errors: number
}

/**
 * Pause trial businesses whose time or minute cap has elapsed.
 * Mirrors call-end logic in the Retell webhook so inactive accounts stop answering
 * without waiting for another call.
 */
export async function expireEndedTrials(now: Date = new Date()): Promise<ExpireTrialsResult> {
  const candidates = await db.business.findMany({
    where: {
      status: ClientStatus.ACTIVE,
      subscriptionStatus: { not: SubscriptionStatus.ACTIVE },
      OR: [
        { trialEndsAt: { lt: now } },
        { trialMinutesUsed: { gte: FREE_TRIAL_MINUTES } },
      ],
    },
    select: { id: true, name: true },
    take: 200,
  })

  let expired = 0
  let errors = 0

  for (const business of candidates) {
    try {
      await db.business.update({
        where: { id: business.id },
        data: { status: ClientStatus.PAUSED },
      })
      await releaseRetellNumber(business.id)
      expired++
      console.info("[Expire trials] Paused business:", business.id, business.name)
    } catch (err) {
      errors++
      console.error("[Expire trials] Failed for business", business.id, err)
    }
  }

  return { scanned: candidates.length, expired, errors }
}
