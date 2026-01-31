"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlanType } from "@prisma/client"

interface UpgradeButtonProps {
  planType: PlanType
  currentPlan?: PlanType | null
  agreedToLegal?: boolean
  addCrmSetup?: boolean
}

export function UpgradeButton({ planType, currentPlan, agreedToLegal = true, addCrmSetup = false }: UpgradeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async () => {
    if (!agreedToLegal) return
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          ...(addCrmSetup ? { addCrmSetup: true } : {}),
        }),
      })

      const data = await response.json()
      if (data.url) {
        router.push(data.url)
        return
      }
      const message = data.error || data.details || (response.ok ? "" : `Checkout failed${data.details ? `: ${data.details}` : ""}`)
      if (message) setError(message)
    } catch {
      setError("Network error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (currentPlan === planType) {
    return (
      <Button disabled className="w-full">
        Current Plan
      </Button>
    )
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={handleUpgrade}
        className="w-full"
        disabled={!agreedToLegal || loading}
      >
        {loading ? "Redirecting…" : currentPlan ? "Switch Plan" : "Subscribe"}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
