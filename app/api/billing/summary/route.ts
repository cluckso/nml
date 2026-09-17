import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { captureRouteError } from "@/lib/capture-error"
import {
  FREE_TRIAL_MINUTES,
  getEffectivePlanType,
  INCLUDED_MINUTES,
  MONTHLY_PRICES,
  OVERAGE_RATE_PER_MIN,
} from "@/lib/plans"
import { getPlanDisplayName } from "@/lib/plan-labels"
import { getTrialStatus } from "@/lib/trial"

/** Current plan, usage, and Stripe-manage flags for the Android billing screen. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!user.businessId) {
      return NextResponse.json({
        businessId: null,
        hasPaidPlan: false,
        canManage: false,
        trial: null,
        plan: null,
        usage: null,
      })
    }

    const [business, usage, trial] = await Promise.all([
      db.business.findUnique({
        where: { id: user.businessId },
        select: {
          planType: true,
          subscriptionStatus: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      }),
      db.usage.findFirst({
        where: {
          businessId: user.businessId,
          billingPeriod: new Date().toISOString().slice(0, 7),
        },
      }),
      getTrialStatus(user.businessId),
    ])

    const isOnTrial = trial.isOnTrial
    const currentPlan = business?.planType ? getEffectivePlanType(business.planType) : null
    const hasPaidPlan =
      !!business?.stripeSubscriptionId &&
      (business.subscriptionStatus === "ACTIVE" || business.subscriptionStatus === "PAST_DUE")
    const minutesUsed = isOnTrial ? trial.minutesUsed : (usage?.minutesUsed ?? 0)
    const minutesIncluded = isOnTrial ? FREE_TRIAL_MINUTES : currentPlan ? INCLUDED_MINUTES[currentPlan] : 0
    const overageMinutes = isOnTrial ? 0 : Math.max(0, minutesUsed - minutesIncluded)

    return NextResponse.json({
      businessId: user.businessId,
      hasPaidPlan,
      canManage: !!business?.stripeCustomerId,
      subscriptionStatus: business?.subscriptionStatus ?? null,
      trial: {
        isOnTrial,
        minutesUsed: trial.minutesUsed,
        minutesRemaining: trial.minutesRemaining,
        isExhausted: trial.isExhausted,
        isExpired: trial.isExpired,
        daysRemaining: trial.daysRemaining,
      },
      plan: currentPlan
        ? {
            planType: currentPlan,
            name: getPlanDisplayName(currentPlan),
            price: MONTHLY_PRICES[currentPlan],
            includedMinutes: INCLUDED_MINUTES[currentPlan],
          }
        : null,
      usage: {
        minutesUsed,
        minutesIncluded,
        overageMinutes,
        overageRatePerMin: OVERAGE_RATE_PER_MIN,
      },
    })
  } catch (error) {
    captureRouteError(error, { route: "GET /api/billing/summary" })
    return NextResponse.json({ error: "Failed to load billing" }, { status: 500 })
  }
}
