"use client"

import Link from "next/link"
import { useState } from "react"
import { UpgradeButton } from "@/components/billing/UpgradeButton"
import { PlanType } from "@prisma/client"

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
  currentPlan: PlanType
  planDetails: Record<string, PlanDetailsEntry>
}) {
  const [agreedToLegal, setAgreedToLegal] = useState(false)

  return (
    <>
      <div className="mb-6 p-4 rounded-lg border bg-muted/50">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToLegal}
            onChange={(e) => setAgreedToLegal(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
            aria-describedby="billing-legal-desc"
          />
          <span id="billing-legal-desc" className="text-sm">
            I agree to the{" "}
            <Link href="/terms" className="text-primary underline hover:no-underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline hover:no-underline">
              Privacy Policy
            </Link>
            . You must accept before changing your plan.
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(planDetails).map(([planType, details]) => (
          <div
            key={planType}
            className={`border rounded-lg p-6 ${
              currentPlan === planType ? "border-primary" : ""
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{details.name}</h3>
            <p className="text-3xl font-bold mb-2">${details.price}/mo</p>
            <p className="text-sm text-muted-foreground mb-4">
              {details.minutes} minutes included
            </p>
            <UpgradeButton
              planType={planType as PlanType}
              currentPlan={currentPlan}
              agreedToLegal={agreedToLegal}
            />
          </div>
        ))}
      </div>
    </>
  )
}
