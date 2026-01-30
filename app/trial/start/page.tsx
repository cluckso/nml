import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TrialStartClient } from "./TrialStartClient"

export const dynamic = "force-dynamic"

/**
 * Start free trial: if no business, show form (business phone + card via Stripe).
 * After eligibility + card, user lands on onboarding. If business exists, redirect accordingly.
 */
export default async function TrialStartPage() {
  const user = await requireAuth()

  if (!user.businessId) {
    return <TrialStartClient />
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId! },
  })
  if (business?.onboardingComplete) {
    redirect("/dashboard")
  }
  redirect("/onboarding")
}
