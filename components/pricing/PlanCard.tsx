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

export function PlanCard({
  name,
  description,
  features,
  includedMinutes,
  annualPrice,
  annualLabel,
  isLoggedIn,
}: {
  name: string
  description: string
  features: string[]
  includedMinutes?: number
  annualPrice?: number
  annualLabel?: string
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const plan = PRICING_TIERS_BY_KEY[name as keyof typeof PRICING_TIERS_BY_KEY]
  if (!plan) return null

  const legalFieldId = `legal-${plan.planType}`

  const handleGetStarted = async () => {
    if (!isLoggedIn) {
      router.push("/sign-up?next=/pricing")
      return
    }
    if (!agreedToLegal) return
    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan.planType }),
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
    <Card className={plan.popular ? "border-primary border-2 shadow-lg" : ""}>
      <CardHeader>
        {plan.badge && (
          <span className="mb-2 inline-block rounded bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
            {plan.badge}
          </span>
        )}
        {plan.popular && !plan.badge && (
          <span className="mb-2 inline-block rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            Most Popular
          </span>
        )}
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        {includedMinutes != null && (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-medium text-foreground">
              {formatIncludedUsageLabel(includedMinutes)}
            </p>
            {plan.usageNote && (
              <p className="text-xs text-muted-foreground">{plan.usageNote}</p>
            )}
          </div>
        )}
        {annualPrice != null && annualLabel && (
          <p className="text-sm text-muted-foreground mt-2">
            Annual: ${annualPrice}/year ({annualLabel})
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">No setup fee</p>
      </CardHeader>
      <CardContent className="flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
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
            <label
              htmlFor={legalFieldId}
              className="mb-4 flex items-start gap-3 cursor-pointer rounded-lg border bg-muted/40 p-3"
            >
              <input
                id={legalFieldId}
                type="checkbox"
                checked={agreedToLegal}
                onChange={(e) => setAgreedToLegal(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary underline hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline hover:no-underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={handleGetStarted}
              disabled={loading || !agreedToLegal}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                "Choose plan"
              )}
            </Button>
          </>
        ) : (
          <Link href="/sign-up?next=/pricing" className="block mt-auto">
            <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
              Get started
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
