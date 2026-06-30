import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPurchaseFromCheckoutSession } from "@/lib/purchase-success"
import { hasActiveSubscription } from "@/lib/subscription"
import { PurchaseSuccessClient } from "@/components/subscribe/PurchaseSuccessClient"
import { PlanType } from "@prisma/client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Subscription confirmed | CallGrabbr",
  description: "Your CallGrabbr subscription is active. Finish setup or go to your dashboard.",
}

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; upgraded?: string }>
}) {
  const user = await requireAuth()
  const params = await searchParams

  if (!user.businessId) {
    redirect("/trial/start")
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId },
    select: {
      planType: true,
      subscriptionStatus: true,
      onboardingComplete: true,
    },
  })

  if (!business) {
    redirect("/trial/start")
  }

  const isInPlaceUpgrade = params.upgraded === "1"
  let planType: PlanType | null = null
  let isUpgrade = isInPlaceUpgrade

  if (params.session_id) {
    const purchase = await getPurchaseFromCheckoutSession(params.session_id, user.businessId)
    if (purchase) {
      planType = purchase.planType
    }
  } else if (isInPlaceUpgrade && business.subscriptionStatus === "ACTIVE" && business.planType) {
    planType = business.planType
  } else if (await hasActiveSubscription(user.businessId)) {
    planType = business.planType
    isUpgrade = business.onboardingComplete
  }

  if (!planType) {
    return (
      <PurchaseSuccessClient
        state="error"
        message="We couldn't verify your subscription. If you just paid, wait a moment and refresh, or check Billing for your plan status."
      />
    )
  }

  return (
    <PurchaseSuccessClient
      state="success"
      planType={planType}
      onboardingComplete={business.onboardingComplete}
      isUpgrade={isUpgrade}
    />
  )
}
