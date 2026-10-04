"use client"

import { useMemo, useState } from "react"
import { PlanCard } from "@/components/pricing/PlanCard"
import { PricingBillingToggle } from "@/components/pricing/PricingBillingToggle"
import {
  PricingIntentBanner,
  PricingPlanScrollTarget,
} from "@/components/pricing/PricingIntentBanner"
import { isAnnualBillingAvailable, type BillingInterval } from "@/lib/stripe-billing"
import { getAnnualPrice } from "@/lib/plans"
import { PRICING_TIERS_BY_KEY, type PricingTierKey } from "@/lib/pricing-catalog"
import type { PricingPlanParam } from "@/lib/pricing-query"

export type PlanInfo = {
  name: string
  description: string
  features: string[]
  includedMinutes?: number
}

export function PricingPlansWithAgreement({
  plans,
  isLoggedIn,
  highlightPlan = null,
  initialBilling = "monthly",
  showMoneyBack = false,
}: {
  plans: PlanInfo[]
  isLoggedIn: boolean
  highlightPlan?: PricingPlanParam | null
  initialBilling?: BillingInterval
  showMoneyBack?: boolean
}) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialBilling)

  const annualAvailable = useMemo(
    () =>
      plans.some((p) =>
        isAnnualBillingAvailable(PRICING_TIERS_BY_KEY[p.name as PricingTierKey]?.planType)
      ),
    [plans]
  )

  return (
    <>
      <PricingIntentBanner show={showMoneyBack} />
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
          const showAnnual =
            billingInterval === "annual" && isAnnualBillingAvailable(tier.planType)
          const recommended = highlightPlan
            ? tier.planType === highlightPlan
            : tier.popular
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
                recommended={recommended}
                showMoneyBack={showMoneyBack}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
