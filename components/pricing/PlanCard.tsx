"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { PlanType } from "@prisma/client"
import { hasCrmSetupAddonAvailable } from "@/lib/plans"

const PLANS: Record<string, { name: string; price: number; planType: PlanType; popular: boolean }> = {
  Basic: { name: "Basic", price: 99, planType: PlanType.STARTER, popular: false },
  Pro: { name: "Pro", price: 229, planType: PlanType.PRO, popular: true },
  "Local Plus": { name: "Local Plus", price: 349, planType: PlanType.LOCAL_PLUS, popular: false },
}

export function PlanCard({
  name,
  description,
  features,
  annualPrice,
  annualLabel,
  isLoggedIn,
  agreedToLegal = true,
}: {
  name: string
  description: string
  features: string[]
  annualPrice?: number
  annualLabel?: string
  isLoggedIn: boolean
  agreedToLegal?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const plan = PLANS[name]
  const showCrmNote = plan && hasCrmSetupAddonAvailable(plan.planType)
  if (!plan) return null

  const handleGetStarted = async () => {
    if (!isLoggedIn) {
      router.push(`/sign-up?next=/pricing`)
      return
    }
    if (!agreedToLegal) return
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan.planType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || data.details || "Something went wrong")
    } catch (e) {
      alert("Network or server error. Check the terminal for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={plan.popular ? "border-primary border-2 shadow-lg" : ""}>
      <CardHeader>
        {plan.popular && (
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
        {annualPrice != null && annualLabel && (
          <p className="text-sm text-muted-foreground mt-2">
            Annual: ${annualPrice}/year ({annualLabel})
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">No setup fee</p>
      </CardHeader>
      <CardContent>
        {showCrmNote && (
          <p className="mb-4 text-sm text-muted-foreground">Contact us for CRM setup pricing.</p>
        )}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        {isLoggedIn ? (
          <>
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
                "Choose plan & continue"
              )}
            </Button>
            {!agreedToLegal && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Accept Terms and Privacy above to continue.
              </p>
            )}
          </>
        ) : (
          <Link href="/sign-up?next=/pricing" className="block">
            <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
              Get started
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
