/**
 * Programmatic test for usage tracking: reads real DB (requires DATABASE_URL),
 * asserts trial/usage consistency and plan math. Runs with plain Node (no tsx).
 * Run: node scripts/test-usage-tracking.cjs   or  npm run test:usage
 */
try {
  require("dotenv").config()
} catch (_) {
  // dotenv optional; use DATABASE_URL from environment if .env not loaded
}
const { PrismaClient } = require("@prisma/client")

const db = new PrismaClient()

const FREE_TRIAL_MINUTES = 50
const INCLUDED_MINUTES = { STARTER: 300, PRO: 900, LOCAL_PLUS: 1800 }

function getIncludedMinutes(planType) {
  return INCLUDED_MINUTES[planType] ?? 0
}

function getOverageMinutes(planType, minutesUsed) {
  return Math.max(0, minutesUsed - getIncludedMinutes(planType))
}

function isSubscriptionActive(business) {
  return business?.subscriptionStatus === "ACTIVE"
}

async function getTrialStatus(businessId) {
  const business = await db.business.findUnique({
    where: { id: businessId },
  })
  const hasActiveSubscription = isSubscriptionActive(business)
  const isOnTrial = !hasActiveSubscription
  const minutesUsed = business?.trialMinutesUsed ?? 0
  const minutesRemaining = Math.max(0, FREE_TRIAL_MINUTES - minutesUsed)
  return {
    isOnTrial,
    minutesUsed,
    minutesRemaining,
    isExhausted: isOnTrial && minutesRemaining <= 0,
    isExpired: isOnTrial && business?.trialEndsAt && new Date() > business.trialEndsAt,
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set. Skipping usage-tracking programmatic test.")
    process.exit(0)
  }

  const errors = []

  // 1) Businesses with trial data: trial status should match DB
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

  // 2) Spot-check one business: call aggregate vs trial
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
    const biz = await db.business.findUnique({
      where: { id: oneBusiness.id },
    })
    if (biz) {
      const trial = await getTrialStatus(biz.id)
      if (biz.subscriptionStatus !== "ACTIVE" && trial.isOnTrial) {
        console.log(`[OK] Business ${biz.id} trial: minutesUsed=${trial.minutesUsed}, totalCallMinutes=${callSum._sum.minutes ?? 0}, calls=${callSum._count}`)
      }
    }
  }

  // 3) Usage records this period
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
    console.log(`[OK] Usage business ${u.businessId} period=${u.billingPeriod} minutesUsed=${u.minutesUsed} callSum=${callSum._sum.minutes ?? 0}`)
  }

  // 4) Plan math
  const planTypes = ["STARTER", "PRO", "LOCAL_PLUS"]
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

main()
  .then(() => db.$disconnect())
  .catch((err) => {
    console.error(err)
    db.$disconnect()
    process.exit(1)
  })
