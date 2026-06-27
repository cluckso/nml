import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getEffectivePlanType, FREE_TRIAL_MINUTES, MONTHLY_PRICES, INCLUDED_MINUTES, SETUP_FEES, OVERAGE_RATE_PER_MIN } from "@/lib/plans"
import { getPlanDisplayName } from "@/lib/plan-labels"
import { getTrialStatus } from "@/lib/trial"
import { getIntakeNumberForIndustry, hasIntakeNumberConfigured } from "@/lib/intake-routing"
import { formatPhoneForDisplay } from "@/lib/utils"
import { PlanType } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BillingPlansWithAgreement } from "@/components/billing/BillingPlansWithAgreement"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

const PLAN_DETAILS = {
  [PlanType.STARTER]: {
    name: getPlanDisplayName(PlanType.STARTER),
    price: MONTHLY_PRICES[PlanType.STARTER],
    minutes: INCLUDED_MINUTES[PlanType.STARTER],
    setupFee: SETUP_FEES[PlanType.STARTER],
  },
  [PlanType.PRO]: {
    name: getPlanDisplayName(PlanType.PRO),
    price: MONTHLY_PRICES[PlanType.PRO],
    minutes: INCLUDED_MINUTES[PlanType.PRO],
    setupFee: SETUP_FEES[PlanType.PRO],
  },
  [PlanType.LOCAL_PLUS]: {
    name: getPlanDisplayName(PlanType.LOCAL_PLUS),
    price: MONTHLY_PRICES[PlanType.LOCAL_PLUS],
    minutes: INCLUDED_MINUTES[PlanType.LOCAL_PLUS],
    setupFee: SETUP_FEES[PlanType.LOCAL_PLUS],
  },
  [PlanType.ELITE]: {
    name: getPlanDisplayName(PlanType.ELITE),
    price: MONTHLY_PRICES[PlanType.ELITE],
    minutes: INCLUDED_MINUTES[PlanType.ELITE],
    setupFee: SETUP_FEES[PlanType.ELITE],
  },
}

export default async function BillingPage() {
  const user = await requireAuth()
  
  if (!user.businessId) {
    redirect("/onboarding")
  }

  const [business, usage, trial] = await Promise.all([
    db.business.findUnique({
      where: { id: user.businessId },
    }),
    db.usage.findFirst({
      where: {
        businessId: user.businessId,
        billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
      },
    }),
    getTrialStatus(user.businessId),
  ])

  const isOnTrial = trial.isOnTrial
  const currentPlan = business?.planType ? getEffectivePlanType(business.planType) : null
  const planDetails = currentPlan ? PLAN_DETAILS[currentPlan] : null
  const minutesUsed = isOnTrial ? trial.minutesUsed : (usage?.minutesUsed ?? 0)
  const minutesIncluded = isOnTrial ? FREE_TRIAL_MINUTES : (planDetails?.minutes ?? 0)
  const overageMinutes = isOnTrial ? 0 : Math.max(0, minutesUsed - minutesIncluded)
  const overageCost = overageMinutes * OVERAGE_RATE_PER_MIN
  // Prefer business's dedicated Retell number, fall back to shared intake number
  const intakeNumber = business?.retellPhoneNumber || getIntakeNumberForIndustry(business?.industry ?? null)
  const showIntakeNumber = !!intakeNumber

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Usage</h1>

      {showIntakeNumber && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Forward calls to this number
            </CardTitle>
            <CardDescription>
              Set your business line to forward to this number so your call assistant answers. See <Link href="/docs/faq" className="text-primary underline">Help & FAQ</Link> for carrier steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-mono font-semibold">{formatPhoneForDisplay(intakeNumber) || intakeNumber}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {isOnTrial
                ? trial.isExhausted || trial.isExpired
                  ? "Trial ended or used — upgrade to continue"
                  : "Free trial — 7 days"
                : planDetails
                  ? planDetails.name
                  : "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOnTrial ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">Free trial</p>
                <p className="text-sm text-muted-foreground">
                  7-day free trial. Upgrade to Solo, Team, or Pro when you&apos;re ready.
                </p>
                {(trial.isExhausted || trial.isExpired) && (
                  <Button asChild className="mt-2">
                    <Link href="/billing#plans">Upgrade to keep receiving calls</Link>
                  </Button>
                )}
              </div>
            ) : (
              planDetails && (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">${planDetails.price}/month</p>
                  <p className="text-sm text-muted-foreground">
                    Includes {planDetails.minutes} minutes
                  </p>
                  {business?.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground">
                      Next billing: {new Date(business.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isOnTrial ? "Trial usage" : "Usage This Month"}</CardTitle>
            <CardDescription>
              {isOnTrial ? "Free trial minutes" : "Current billing period"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Minutes used:</span>
                <span className="font-semibold">{Math.ceil(minutesUsed)} / {minutesIncluded}</span>
              </div>
              {!isOnTrial && overageMinutes > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overage:</span>
                  <span className="font-semibold">${overageCost.toFixed(2)}</span>
                </div>
              )}
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, minutesIncluded > 0 ? (minutesUsed / minutesIncluded) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="plans">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            {isOnTrial ? "Upgrade to continue when you're ready" : "Upgrade or change your plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingPlansWithAgreement
            currentPlan={currentPlan}
            planDetails={{
              [PlanType.STARTER]: PLAN_DETAILS[PlanType.STARTER],
              [PlanType.PRO]: PLAN_DETAILS[PlanType.PRO],
              [PlanType.ELITE]: PLAN_DETAILS[PlanType.ELITE],
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
