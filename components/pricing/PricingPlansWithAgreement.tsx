"use client"

import Link from "next/link"
import { useState } from "react"
import { PlanCard } from "@/components/pricing/PlanCard"

export type PlanInfo = {
  name: string
  description: string
  features: string[]
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
  const [agreedToLegal, setAgreedToLegal] = useState(false)

  return (
    <>
      {isLoggedIn && (
        <div className="mb-8 p-4 rounded-lg border bg-muted/50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToLegal}
              onChange={(e) => setAgreedToLegal(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input accent-primary"
              aria-describedby="legal-desc"
            />
            <span id="legal-desc" className="text-sm">
              I agree to the{" "}
              <Link href="/terms" className="text-primary underline hover:no-underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary underline hover:no-underline">
                Privacy Policy
              </Link>
              . You must accept before subscribing.
            </span>
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            description={plan.description}
            features={plan.features}
            annualPrice={plan.annualPrice}
            annualLabel={plan.annualLabel}
            isLoggedIn={isLoggedIn}
            agreedToLegal={agreedToLegal}
          />
        ))}
      </div>
    </>
  )
}
