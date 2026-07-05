import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { PricingTrialCta } from "@/components/pricing/PricingTrialCta"
import { PricingComparisonTable } from "@/components/pricing/PricingComparisonTable"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import {
  formatJobRoiLine,
  formatMissedJobCostLine,
  formatOverageRate,
  formatPricingSummary,
  formatVsHumanLine,
  PRICING_TIERS,
} from "@/lib/pricing-catalog"
import { PLAN_SOLO_OWNER, PLAN_MID_VOLUME } from "@/lib/plan-labels"
import { FREE_TRIAL_MINUTES } from "@/lib/plans"
import { trialSummaryShort, moneyBackGuaranteeLabel, trialConversionLine } from "@/lib/trial-marketing"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import Link from "next/link"
import { pricingUrl } from "@/lib/monetization-urls"
import { PlanType } from "@prisma/client"

export const metadata: Metadata = {
  title: "Pricing - CallGrabbr",
  description: `${formatPricingSummary()}. ${formatJobRoiLine()} ${trialSummaryShort()}.`,
  keywords: [...SEO_KEYWORDS, "CallGrabbr pricing", "AI answering service pricing"],
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing - CallGrabbr",
    description: `${formatPricingSummary()}. ${formatJobRoiLine()}`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - CallGrabbr",
    description: `${formatPricingSummary()}. ${formatJobRoiLine()}`,
    images: [DEFAULT_OG_IMAGE.url],
  },
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
        One captured job pays for months
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {formatJobRoiLine()}
      </p>
      <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
        {formatMissedJobCostLine()}
      </p>
      <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
        {formatVsHumanLine()} · Overage {formatOverageRate()} beyond included calls · ~3 min avg per call
      </p>
      {isLoggedIn && !hasStartedTrial && (
        <p className="mt-2 text-sm text-primary font-medium">
          <Link href={pricingUrl({ intent: "paid", plan: PlanType.STARTER })} className="underline">
            Subscribe now
          </Link>
          {" "}or start a free trial below.
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
          <h2 className="text-2xl font-bold tracking-tight mb-3">Try it with real calls first</h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            {trialConversionLine()}
          </p>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Includes {FREE_TRIAL_MINUTES} call minutes — one trial per business number. Ready to go live?{" "}
            <Link href={pricingUrl({ intent: "paid", plan: PlanType.STARTER })} className="text-primary underline">
              Subscribe with {moneyBackGuaranteeLabel()}
            </Link>
            . Most owners start on <strong>{PLAN_SOLO_OWNER}</strong> for missed &amp; after-hours coverage, then move to{" "}
            <strong>{PLAN_MID_VOLUME}</strong> when they want every call answered.
          </p>
          <PricingTrialCta isLoggedIn={isLoggedIn} />
        </div>
      )}

      <PricingComparisonTable className="mb-16" />

      <AudioExamples />

      <PricingPlansWithAgreement plans={plans} isLoggedIn={isLoggedIn} />

    </div>
  </>
  )
}
