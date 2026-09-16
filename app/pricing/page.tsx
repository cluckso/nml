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
  formatOverageRate,
  formatVsHumanLine,
  PRICING_TIERS,
} from "@/lib/pricing-catalog"
import { PLAN_BASIC, PLAN_GROWTH } from "@/lib/plan-labels"
import { FREE_TRIAL_MINUTES } from "@/lib/plans"
import { moneyBackGuaranteeLabel, trialConversionLine } from "@/lib/trial-marketing"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import { ROSIE_PRICE_OBJECTION } from "@/lib/marketing/positioning"
import { CompareUsLinks } from "@/components/marketing/CompareUsLinks"
import Link from "next/link"
import { pricingUrl } from "@/lib/monetization-urls"
import { PlanType } from "@prisma/client"

const PRICING_TITLE = "Pricing - AI Answering Service for Trades | CallGrabbr"
const PRICING_DESCRIPTION =
  "AI answering service pricing for HVAC, plumbing, and trades. Plans from $99/mo. 14-day free trial. 30-day money-back guarantee."

export const metadata: Metadata = {
  title: PRICING_TITLE,
  description: PRICING_DESCRIPTION,
  keywords: [...SEO_KEYWORDS, "AI answering service pricing", "CallGrabbr pricing", "HVAC answering service"],
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: PRICING_TITLE,
    description: PRICING_DESCRIPTION,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PRICING_TITLE,
    description: PRICING_DESCRIPTION,
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
      <p className="text-lg text-foreground/90 max-w-2xl mx-auto leading-relaxed mb-2">
        You&apos;re not buying software — you&apos;re buying back the jobs that walk while you&apos;re on a call.
      </p>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {formatJobRoiLine()}
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
            . Most owners start on <strong>{PLAN_BASIC}</strong> lead insurance for missed &amp; after-hours jobs, then move to{" "}
            <strong>{PLAN_GROWTH}</strong> when they want full front-desk coverage.
          </p>
          <PricingTrialCta isLoggedIn={isLoggedIn} />
          <p className="text-xs text-muted-foreground mt-4">Payments securely processed by Stripe.</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-14 p-6 rounded-xl border border-border/60 bg-card/40 text-center">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Why not the $49 tools?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{ROSIE_PRICE_OBJECTION}</p>
      </div>

      <PricingComparisonTable className="mb-16" />

      <CompareUsLinks className="mb-16" />

      <AudioExamples />

      <PricingPlansWithAgreement plans={plans} isLoggedIn={isLoggedIn} />

    </div>
  </>
  )
}
