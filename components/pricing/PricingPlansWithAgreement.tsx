"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PlanType } from "@prisma/client"
import { PlanCard } from "@/components/pricing/PlanCard"
import { PricingBillingToggle } from "@/components/pricing/PricingBillingToggle"
import {
  PricingIntentBanner,
  PricingPlanScrollTarget,
  parseBillingFromParams,
  parseHighlightPlanFromParams,
} from "@/components/pricing/PricingIntentBanner"
import { isAnnualBillingAvailable, type BillingInterval } from "@/lib/stripe"
import { getAnnualPrice } from "@/lib/plans"
import { PRICING_TIERS_BY_KEY, type PricingTierKey } from "@/lib/pricing-catalog"
import { PLAN_MID_VOLUME } from "@/lib/plan-labels"

export type PlanInfo = {
  name: string
  description: string
  features: string[]
  includedMinutes?: number
}

function PricingPlansInner({
  plans,
  isLoggedIn,
}: {
  plans: PlanInfo[]
  isLoggedIn: boolean
}) {
  const searchParams = useSearchParams()
  const highlightPlan = parseHighlightPlanFromParams(searchParams)
  const initialBilling = parseBillingFromParams(searchParams)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialBilling)

  const annualAvailable = useMemo(
    () => plans.some((p) => isAnnualBillingAvailable(PRICING_TIERS_BY_KEY[p.name as PricingTierKey]?.planType)),
    [plans]
  )

  const recommendedPlanType = highlightPlan ?? PlanType.PRO

  return (
    <>
      <PricingIntentBanner />
      <PricingPlanScrollTarget highlightPlan={highlightPlan} />
      <PricingBillingToggle
        value={billingInterval}
        onChange={setBillingInterval}
        annualAvailable={annualAvailable}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const tier = PRICING_TIERS_BY_KEY[plan.name as PricingTierKey]
          if (!tier) return null
          const showAnnual = billingInterval === "annual" && isAnnualBillingAvailable(tier.planType)
          return (
            <div key={plan.name} id={`plan-${tier.planType}`}>
              <PlanCard
                name={plan.name}
                description={plan.description}
                features={plan.features}
                includedMinutes={plan.includedMinutes}
                isLoggedIn={isLoggedIn}
                billingInterval={billingInterval}
                annualPrice={showAnnual ? getAnnualPrice(tier.planType) : undefined}
                annualLabel={showAnnual ? `${annualAvailable ? "2 months free" : ""}` : undefined}
                recommended={tier.planType === recommendedPlanType || plan.name === PLAN_MID_VOLUME}
                showMoneyBack={searchParams.get("intent") === "paid"}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export function PricingPlansWithAgreement({
  plans,
  isLoggedIn,
}: {
  plans: PlanInfo[]
  isLoggedIn: boolean
}) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-muted/40" />
        ))}
      </div>
    }>
      <PricingPlansInner plans={plans} isLoggedIn={isLoggedIn} />
    </Suspense>
  )
}
