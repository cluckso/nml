"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlanType } from "@prisma/client"

interface UpgradeButtonProps {
  planType: PlanType
  currentPlan?: PlanType
}

export function UpgradeButton({ planType, currentPlan }: UpgradeButtonProps) {
  const router = useRouter()

  const handleUpgrade = async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    })

    const data = await response.json()
    if (data.url) {
      router.push(data.url)
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
    <Button onClick={handleUpgrade} className="w-full">
      {currentPlan ? "Switch Plan" : "Subscribe"}
    </Button>
  )
}
