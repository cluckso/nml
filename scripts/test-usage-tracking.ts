/**
 * Programmatic test for usage tracking: reads real DB (requires DATABASE_URL),
 * fetches trial status and call/usage aggregates, and asserts consistency.
 * Run: npm run test:usage  (or npx tsx scripts/test-usage-tracking.ts)
 */
import "dotenv/config"
import { db } from "../lib/db"
import { getTrialStatus } from "../lib/trial"
import { getIncludedMinutes, getOverageMinutes, FREE_TRIAL_MINUTES } from "../lib/plans"
import { PlanType } from "@prisma/client"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Skipping usage-tracking programmatic test.")
    process.exit(0)
  }

  const errors: string[] = []

  // 1) Any business with trial data: trial status should match DB fields
  const businessesWithTrial = await db.business.findMany({
    where: {
      OR: [
        { trialMinutesUsed: { gt: 0 } },
        { trialStartedAt: { not: null } },
      ],
    },
    include: { subscription: true },
    take: 5,
  })

  for (const biz of businessesWithTrial) {
    const trial = await getTrialStatus(biz.id)
    const expectedUsed = biz.trialMinutesUsed ?? 0
    if (Math.abs(trial.minutesUsed - expectedUsed) > 0.01) {
      errors.push(`Business ${biz.id}: getTrialStatus.minutesUsed=${trial.minutesUsed} but DB trialMinutesUsed=${expectedUsed}`)
    }
    const expectedRemaining = Math.max(0, FREE_TRIAL_MINUTES - expectedUsed)
    if (Math.abs(trial.minutesRemaining - expectedRemaining) > 0.01) {
      errors.push(`Business ${biz.id}: getTrialStatus.minutesRemaining=${trial.minutesRemaining} but expected ${expectedRemaining}`)
    }
  }

  // 2) Call aggregate: sum of Call.minutes should be consistent (spot-check one business)
  const oneBusiness = await db.business.findFirst({
    where: {},
    select: { id: true },
  })
  if (oneBusiness) {
    const callSum = await db.call.aggregate({
      where: { businessId: oneBusiness.id },
      _sum: { minutes: true },
      _count: true,
    })
    const totalFromCalls = callSum._sum.minutes ?? 0
    const biz = await db.business.findUnique({
      where: { id: oneBusiness.id },
      include: { subscription: true },
    })
    if (biz) {
      const trial = await getTrialStatus(biz.id)
      const hasActiveSub = biz.subscription?.status === "ACTIVE"
      if (!hasActiveSub && trial.isOnTrial) {
        // Trial: Business.trialMinutesUsed should match what webhook increments (we can't assert exact match to Call sum without replaying webhook logic; just log)
        console.log(`[OK] Business ${biz.id} trial: minutesUsed=${trial.minutesUsed}, totalCallMinutes=${totalFromCalls}, calls=${callSum._count}`)
      }
    }
  }

  // 3) Usage record: billing period YYYY-MM and minutesUsed
  const period = new Date().toISOString().slice(0, 7)
  const usageRecords = await db.usage.findMany({
    where: { billingPeriod: period },
    take: 3,
  })
  for (const u of usageRecords) {
    const callSum = await db.call.aggregate({
      where: { businessId: u.businessId },
      _sum: { minutes: true },
    })
    const totalMinutes = callSum._sum.minutes ?? 0
    // Usage.minutesUsed is updated by webhook when reporting to Stripe; it can lag or be per-period. Just log.
    console.log(`[OK] Usage business ${u.businessId} period=${u.billingPeriod} minutesUsed=${u.minutesUsed} callSum=${totalMinutes}`)
  }

  // 4) Plan math: getOverageMinutes and getIncludedMinutes
  const planTypes = [PlanType.STARTER, PlanType.PRO, PlanType.LOCAL_PLUS]
  for (const plan of planTypes) {
    const included = getIncludedMinutes(plan)
    const overage0 = getOverageMinutes(plan, included)
    const overage100 = getOverageMinutes(plan, included + 100)
    if (overage0 !== 0 || overage100 !== 100) {
      errors.push(`Plan ${plan}: getOverageMinutes(${plan}, ${included})=${overage0}, getOverageMinutes(${plan}, ${included + 100})=${overage100}`)
    }
  }

  if (errors.length > 0) {
    console.error("Usage tracking assertions failed:")
    errors.forEach((e) => console.error("  -", e))
    process.exit(1)
  }

  console.log("Usage tracking programmatic checks passed.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
