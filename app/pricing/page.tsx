import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import { Button } from "@/components/ui/button"
import {
  formatJobRoiLine,
  formatOverageRate,
  formatPricingSummary,
  PRICING_TIERS,
} from "@/lib/pricing-catalog"
import { PLAN_SOLO_OWNER, PLAN_MID_VOLUME } from "@/lib/plan-labels"

export const metadata: Metadata = {
  title: "Pricing - CallGrabbr",
  description: `Stop losing jobs to voicemail. ${formatPricingSummary()}. ${formatJobRoiLine()} 7-day free trial, no card required.`,
  alternates: { canonical: "/pricing" },
}

export default async function PricingPage() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  const business = user?.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
        select: { trialStartedAt: true },
      })
    : null
  const hasStartedTrial = !!business?.trialStartedAt

  const plans = PRICING_TIERS.map(({ key, description, includedMinutes, features }) => ({
    name: key,
    description,
    includedMinutes,
    features,
  }))

  return (
  <>
    <SectionBackdrop
      src={MARKETING_IMAGES.hero}
      alt={MARKETING_IMAGE_ALT.hero}
      overlay="hero"
      className="py-20 border-b border-border/50"
      contentClassName="container mx-auto px-4 text-center"
    >
      <h1 className="text-4xl font-bold mb-4">Missed call = lost job. Pick your coverage.</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {formatJobRoiLine()}
      </p>
      <p className="mt-2 text-muted-foreground">
        7-day free trial. No card required. Overage {formatOverageRate()} after included minutes.
      </p>
      {isLoggedIn && !hasStartedTrial && (
        <p className="mt-2 text-sm text-primary font-medium">
          Start a free trial or pick a plan below.
        </p>
      )}
      {isLoggedIn && hasStartedTrial && (
        <p className="mt-2 text-sm text-primary font-medium">
          Pick a plan to upgrade.
        </p>
      )}
    </SectionBackdrop>

    <div className="container mx-auto px-4 py-16">
      {!hasStartedTrial && (
        <div className="max-w-2xl mx-auto mb-12 p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold mb-2">Free trial — no card required</h2>
          <p className="text-muted-foreground mb-4">
            7-day free trial. We won&apos;t charge until you choose a plan. Includes 40 call minutes. One trial per business number.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Most solo owners start on <strong>{PLAN_SOLO_OWNER}</strong> — upgrade to {PLAN_MID_VOLUME} when call volume and crew size grow.
          </p>
          {isLoggedIn ? (
            <Button size="lg" asChild>
              <Link href="/trial/start">Start your free trial</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/sign-up">Sign up to start free trial</Link>
            </Button>
          )}
        </div>
      )}

      <AudioExamples />

      <PricingPlansWithAgreement plans={plans} isLoggedIn={isLoggedIn} />

    </div>
  </>
  )
}
