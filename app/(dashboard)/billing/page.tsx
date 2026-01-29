import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getEffectivePlanType } from "@/lib/plans"
import { PlanType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BillingPlansWithAgreement } from "@/components/billing/BillingPlansWithAgreement"

const PLAN_DETAILS = {
  [PlanType.STARTER]: {
    name: "Basic",
    price: 99,
    minutes: 500,
    setupFee: 0,
  },
  [PlanType.PRO]: {
    name: "Pro",
    price: 199,
    minutes: 1200,
    setupFee: 0,
  },
  [PlanType.LOCAL_PLUS]: {
    name: "Local Plus",
    price: 299,
    minutes: 2500,
    setupFee: 0,
  },
}

export default async function BillingPage() {
  const user = await requireAuth()
  
  if (!user.businessId) {
    redirect("/onboarding")
  }

  const [business, subscription, usage] = await Promise.all([
    db.business.findUnique({
      where: { id: user.businessId },
    }),
    db.subscription.findUnique({
      where: { businessId: user.businessId },
    }),
    db.usage.findFirst({
      where: {
        businessId: user.businessId,
        billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
      },
    }),
  ])

  const currentPlan = getEffectivePlanType(subscription?.planType)
  const planDetails = PLAN_DETAILS[currentPlan]
  const minutesUsed = usage?.minutesUsed || 0
  const minutesIncluded = planDetails?.minutes || 0
  const overageMinutes = Math.max(0, minutesUsed - minutesIncluded)
  const overageCost = overageMinutes * 0.1

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Usage</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {planDetails ? planDetails.name : "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {planDetails && (
              <div className="space-y-2">
                <p className="text-2xl font-bold">${planDetails.price}/month</p>
                <p className="text-sm text-muted-foreground">
                  Includes {planDetails.minutes} minutes
                </p>
                {subscription && (
                  <p className="text-sm text-muted-foreground">
                    Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Current billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Minutes used:</span>
                <span className="font-semibold">{Math.ceil(minutesUsed)} / {minutesIncluded}</span>
              </div>
              {overageMinutes > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overage:</span>
                  <span className="font-semibold">${overageCost.toFixed(2)}</span>
                </div>
              )}
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (minutesUsed / minutesIncluded) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade or change your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <BillingPlansWithAgreement
            currentPlan={currentPlan}
            planDetails={PLAN_DETAILS}
          />
        </CardContent>
      </Card>
    </div>
  )
}
