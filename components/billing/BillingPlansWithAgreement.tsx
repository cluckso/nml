"use client"

import { UpgradeButton } from "@/components/billing/UpgradeButton"
import { PlanType } from "@prisma/client"
import { formatIncludedUsageShort } from "@/lib/pricing-catalog"

export type PlanDetailsEntry = {
  name: string
  price: number
  minutes: number
  setupFee: number
}

export function BillingPlansWithAgreement({
  currentPlan,
  planDetails,
}: {
  currentPlan: PlanType | null
  planDetails: Record<string, PlanDetailsEntry>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(planDetails).map(([planType, details]) => (
        <div
          key={planType}
          className={`border rounded-lg p-6 ${
            currentPlan != null && currentPlan === planType ? "border-primary" : ""
          }`}
        >
          <h3 className="text-xl font-semibold mb-2">{details.name}</h3>
          <p className="text-3xl font-bold mb-2">${details.price}/mo</p>
          <p className="text-sm text-muted-foreground mb-1">
            {details.minutes.toLocaleString()} minutes included
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {formatIncludedUsageShort(details.minutes)}
          </p>
          <UpgradeButton planType={planType as PlanType} currentPlan={currentPlan} />
        </div>
      ))}
    </div>
  )
}
