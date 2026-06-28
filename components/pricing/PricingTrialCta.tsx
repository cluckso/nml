"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LegalConsentCheckbox } from "@/components/legal/LegalConsentCheckbox"

export function PricingTrialCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const href = isLoggedIn ? "/trial/start" : "/sign-up?next=%2Ftrial%2Fstart"

  return (
    <div className="space-y-4">
      <LegalConsentCheckbox
        id="pricing-trial-legal"
        checked={agreedToLegal}
        onChange={setAgreedToLegal}
        className="text-left"
      />
      {agreedToLegal ? (
        <Button size="lg" asChild>
          <Link href={href}>
            {isLoggedIn ? "Start your free trial" : "Sign up to start free trial"}
          </Link>
        </Button>
      ) : (
        <Button size="lg" disabled>
          {isLoggedIn ? "Start your free trial" : "Sign up to start free trial"}
        </Button>
      )}
    </div>
  )
}
