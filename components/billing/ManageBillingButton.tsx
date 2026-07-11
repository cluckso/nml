"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

/** Opens Stripe Customer Portal to manage payment method, invoices, and cancel. */
export function ManageBillingButton({
  hasStripeCustomer,
  className,
}: {
  hasStripeCustomer: boolean
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!hasStripeCustomer) return null

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not open billing portal")
      if (!data.url) throw new Error("No portal URL returned")
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button type="button" variant="outline" onClick={openPortal} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Opening…
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage billing &amp; cancel
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
