"use client"

import { PlanCard } from "@/components/pricing/PlanCard"

export type PlanInfo = {
  name: string
  description: string
  features: string[]
  includedMinutes?: number
  annualPrice?: number
  annualLabel?: string
}

export function PricingPlansWithAgreement({
  plans,
  isLoggedIn,
}: {
  plans: PlanInfo[]
  isLoggedIn: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {plans.map((plan) => (
        <PlanCard
          key={plan.name}
          name={plan.name}
          description={plan.description}
          features={plan.features}
          includedMinutes={plan.includedMinutes}
          annualPrice={plan.annualPrice}
          annualLabel={plan.annualLabel}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  )
}
