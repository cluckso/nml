import { NextResponse } from "next/server"
import { PRICING_TIERS } from "@/lib/pricing-catalog"
import { FREE_TRIAL_MINUTES, OVERAGE_RATE_PER_MIN, TRIAL_DAYS } from "@/lib/plans"
import { HERO_CATEGORY_LINE, HERO_H1, HERO_SUB, PRIMARY_CTA } from "@/lib/marketing/positioning"
import { trialSummaryWithMinutes } from "@/lib/trial-marketing"

/** Public plan catalog for the Android marketing/billing screens. */
export async function GET() {
  return NextResponse.json(
    {
      marketing: {
        headline: HERO_H1,
        categoryLine: HERO_CATEGORY_LINE,
        sub: HERO_SUB,
        primaryCta: PRIMARY_CTA,
        trialSummary: trialSummaryWithMinutes(),
      },
      trial: {
        days: TRIAL_DAYS,
        minutes: FREE_TRIAL_MINUTES,
        noCardRequired: true,
      },
      overageRatePerMin: OVERAGE_RATE_PER_MIN,
      billing: {
        processor: "stripe",
        merchantOfRecord: "CallGrabbr",
        playDisclosure:
          "CallGrabbr is a phone answering service billed by CallGrabbr through Stripe. Google Play is not the merchant of record for website checkout. In eligible Play Billing Choice regions, Google may show a required disclosure before opening the CallGrabbr website.",
      },
      plans: PRICING_TIERS.map((tier) => ({
        planType: tier.planType,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        includedMinutes: tier.includedMinutes,
        badge: tier.badge ?? null,
        popular: tier.popular,
        subtitle: tier.subtitle,
        features: tier.features,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  )
}
