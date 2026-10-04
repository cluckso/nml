"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { moneyBackGuaranteeLabel, MONEY_BACK_GUARANTEE_DAYS } from "@/lib/trial-marketing"
import { Shield } from "lucide-react"
import type { PricingPlanParam } from "@/lib/pricing-query"

export function PricingIntentBanner({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <Card className="max-w-3xl mx-auto mb-10 border-primary/30 bg-primary/5">
      <CardContent className="pt-6 pb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary font-semibold">
          <Shield className="h-5 w-5" aria-hidden />
          {moneyBackGuaranteeLabel()}
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Subscribe today and finish setup in minutes. If CallGrabbr isn&apos;t the right fit within{" "}
          {MONEY_BACK_GUARANTEE_DAYS} days, contact support for a full refund of your first month.
        </p>
      </CardContent>
    </Card>
  )
}

/** Scroll highlighted plan into view when ?plan=PRO etc. */
export function PricingPlanScrollTarget({
  highlightPlan,
}: {
  highlightPlan: PricingPlanParam | null
}) {
  const scrolled = useRef(false)

  useEffect(() => {
    if (!highlightPlan || scrolled.current) return
    const el = document.getElementById(`plan-${highlightPlan}`)
    if (el) {
      scrolled.current = true
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlightPlan])

  return null
}
