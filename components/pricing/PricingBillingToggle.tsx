"use client"

import { Button } from "@/components/ui/button"
import { annualSavingsLabel } from "@/lib/trial-marketing"
import type { BillingInterval } from "@/lib/stripe"

export function PricingBillingToggle({
  value,
  onChange,
  annualAvailable,
}: {
  value: BillingInterval
  onChange: (interval: BillingInterval) => void
  annualAvailable: boolean
}) {
  if (!annualAvailable) return null

  return (
    <div className="flex flex-col items-center gap-2 mb-10">
      <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
        <Button
          type="button"
          size="sm"
          variant={value === "monthly" ? "default" : "ghost"}
          onClick={() => onChange("monthly")}
        >
          Monthly
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === "annual" ? "default" : "ghost"}
          onClick={() => onChange("annual")}
        >
          Annual · {annualSavingsLabel()}
        </Button>
      </div>
    </div>
  )
}
