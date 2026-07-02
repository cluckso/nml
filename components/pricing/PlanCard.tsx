"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { trackSubscribe } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { PRICING_TIERS_BY_KEY } from "@/lib/pricing-catalog"
import { formatIncludedUsageLabel } from "@/lib/plan-usage"
import { LegalConsentCheckbox } from "@/components/legal/LegalConsentCheckbox"
import { moneyBackGuaranteeLabel } from "@/lib/trial-marketing"
import type { BillingInterval } from "@/lib/stripe"

export function PlanCard({
  name,
  description,
  features,
  includedMinutes,
  annualPrice,
  annualLabel,
  isLoggedIn,
  billingInterval = "monthly",
  recommended = false,
  showMoneyBack = false,
}: {
  name: string
  description: string
  features: string[]
  includedMinutes?: number
  annualPrice?: number
  annualLabel?: string
  isLoggedIn: boolean
  billingInterval?: BillingInterval
  recommended?: boolean
  showMoneyBack?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const plan = PRICING_TIERS_BY_KEY[name as keyof typeof PRICING_TIERS_BY_KEY]
  if (!plan) return null

  const legalFieldId = `legal-${plan.planType}`
  const isPopular = plan.popular || recommended
  const displayPrice =
    billingInterval === "annual" && annualPrice != null
      ? Math.round(annualPrice / 12)
      : plan.price
  const priceSuffix =
    billingInterval === "annual" && annualPrice != null ? "/ mo · billed annually" : "/ month"

  const handleGetStarted = async () => {
    if (!isLoggedIn) {
      const next = `/pricing?intent=paid&plan=${plan.planType}${billingInterval === "annual" ? "&billing=annual" : ""}`
      router.push(`/sign-up?next=${encodeURIComponent(next)}`)
      return
    }
    if (!agreedToLegal) return
    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: plan.planType,
          billingInterval,
        }),
      })
      const data = await res.json()
      if (data.url) {
        trackSubscribe(plan.name)
        window.location.href = data.url
      } else setCheckoutError(data.error || data.details || "Something went wrong. Please try again.")
    } catch {
      setCheckoutError("Network or server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className={`flex flex-col h-full ${isPopular ? "border-primary border-2 shadow-lg ring-2 ring-primary/20" : ""}`}
    >
      <CardHeader className="space-y-3 pb-4">
        {isPopular && (
          <span className="inline-block w-fit rounded bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {plan.badge ?? "Recommended"}
          </span>
        )}
        <div>
          <CardTitle className="text-2xl tracking-tight">{plan.name}</CardTitle>
          <CardDescription className="mt-1.5 text-sm leading-relaxed">{description}</CardDescription>
        </div>
        <div className="pt-1">
          <span className="text-4xl font-bold tracking-tight">${displayPrice}</span>
          <span className="text-muted-foreground text-sm">{priceSuffix}</span>
        </div>
        {billingInterval === "annual" && annualPrice != null && (
          <p className="text-sm text-muted-foreground">
            ${annualPrice.toLocaleString()}/year {annualLabel ? `(${annualLabel})` : ""}
          </p>
        )}
        {includedMinutes != null && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-1">
            <p className="text-sm font-medium leading-snug text-foreground">
              {formatIncludedUsageLabel(includedMinutes)}
            </p>
            {plan.usageNote && (
              <p className="text-xs leading-relaxed text-muted-foreground">{plan.usageNote}</p>
            )}
          </div>
        )}
        {showMoneyBack && (
          <p className="text-xs text-primary font-medium">{moneyBackGuaranteeLabel()}</p>
        )}
        <p className="text-xs text-muted-foreground">No setup fee</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden />
              <span className="text-sm leading-snug text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
        {isLoggedIn ? (
          <>
            {checkoutError && (
              <p className="text-sm text-destructive mb-2 rounded-md bg-destructive/10 px-3 py-2" role="alert">
                {checkoutError}
              </p>
            )}
            <LegalConsentCheckbox
              id={legalFieldId}
              checked={agreedToLegal}
              onChange={setAgreedToLegal}
            />
            <Button
              className="w-full mt-auto"
              variant={isPopular ? "default" : "outline"}
              onClick={handleGetStarted}
              disabled={loading || !agreedToLegal}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </>
        ) : (
          <Link
            href={`/sign-up?next=${encodeURIComponent(`/pricing?intent=paid&plan=${plan.planType}`)}`}
            className="block mt-auto"
          >
            <Button className="w-full" variant={isPopular ? "default" : "outline"}>
              Get started
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
