import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { TrialStartClient } from "./TrialStartClient"
import { trialStartMetaDescription } from "@/lib/trial-marketing"
import { JsonLd } from "@/components/seo/JsonLd"
import { webPageJsonLd } from "@/lib/structured-data"

const TRIAL_TITLE = "Start your CallGrabbr free trial"

export const metadata: Metadata = {
  title: TRIAL_TITLE,
  description: trialStartMetaDescription(),
  alternates: { canonical: "/trial/start" },
}

export const dynamic = "force-dynamic"

/**
 * Start free trial: if no business, show form (business phone + card via Stripe).
 * After eligibility + card, user lands on onboarding. If business exists, redirect accordingly.
 */
export default async function TrialStartPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-up?next=" + encodeURIComponent("/trial/start"))
  }

  if (!user.businessId) {
    return (
      <Suspense fallback={<div className="container mx-auto max-w-md py-12 text-center text-muted-foreground">Loading…</div>}>
        <JsonLd
          data={webPageJsonLd({
            name: TRIAL_TITLE,
            description: trialStartMetaDescription(),
            path: "/trial/start",
          })}
        />
        <TrialStartClient />
      </Suspense>
    )
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId! },
  })
  if (business?.onboardingComplete) {
    redirect("/dashboard")
  }
  redirect("/onboarding")
}
