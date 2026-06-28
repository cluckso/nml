import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { PricingTrialCta } from "@/components/pricing/PricingTrialCta"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import {
  formatJobRoiLine,
  formatOverageRate,
  formatPricingSummary,
  PRICING_TIERS,
} from "@/lib/pricing-catalog"
import { PLAN_SOLO_OWNER, PLAN_MID_VOLUME } from "@/lib/plan-labels"

export const metadata: Metadata = {
  title: "Pricing - CallGrabbr",
  description: `Plans for every call volume. ${formatPricingSummary()}. ${formatJobRoiLine()} 7-day free trial, no credit card required.`,
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
      src={MARKETING_IMAGES.leadCapture}
      alt={MARKETING_IMAGE_ALT.leadCapture}
      overlay="hero"
      imageClassName="object-cover object-[center_35%] scale-105"
      className="py-20 border-b border-border/50"
      contentClassName="container mx-auto px-4 text-center"
    >
      <h1 className="text-4xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
        Plans that match how you handle calls
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {formatJobRoiLine()}
      </p>
      <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
        7-day free trial · No credit card required · Overage {formatOverageRate()} beyond included
        minutes · Estimates based on ~3 min per call
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
        <div className="max-w-2xl mx-auto mb-14 p-8 rounded-xl border border-primary/20 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Try it free for 7 days</h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            No charge until you choose a plan. Includes 40 call minutes—one trial per business
            number.
          </p>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Most owners start on <strong>{PLAN_SOLO_OWNER}</strong> for missed and after-hours
            coverage, then move to <strong>{PLAN_MID_VOLUME}</strong> when the team grows and calls
            need a full-time answer.
          </p>
          <PricingTrialCta isLoggedIn={isLoggedIn} />
        </div>
      )}

      <AudioExamples />

      <PricingPlansWithAgreement plans={plans} isLoggedIn={isLoggedIn} />

    </div>
  </>
  )
}
