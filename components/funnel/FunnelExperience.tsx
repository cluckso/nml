"use client"

import { useEffect, useState } from "react"
import type { FunnelConfig } from "@/lib/funnel/funnel-config"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { getIndustryImageAlt } from "@/lib/marketing-images"
import { calculateLeadScore } from "@/lib/funnel/lead-scoring"
import { calculateFunnelRoi } from "@/lib/funnel/roi-calculator"
import { formatCurrency } from "@/lib/industry-data"
import { trackFunnelConversion, trackFunnelView } from "@/lib/funnel/analytics"
import { FunnelStepForm, getCallsPerWeekFromVolume } from "./FunnelStepForm"
import { FunnelRoiCalculator } from "./FunnelRoiCalculator"
import { FunnelDemoSection } from "./FunnelDemoSection"
import { FunnelTestimonial } from "./FunnelTestimonial"
import { FunnelPricingCta } from "./FunnelPricingCta"
import { useFunnelLead } from "./useFunnelLead"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { saveFunnelTrialContext, buildFunnelTrialStartUrl } from "@/lib/funnel/funnel-trial-bridge"
import { funnelSubscribeUrl } from "@/lib/monetization-urls"

interface FunnelExperienceProps {
  config: FunnelConfig
}

export function FunnelExperience({ config }: FunnelExperienceProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const { submitting, submitted, error, submitLead } = useFunnelLead()

  useEffect(() => {
    trackFunnelView(config.slug)
  }, [config.slug])

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleComplete = async () => {
    const callsPerWeek = getCallsPerWeekFromVolume(values.callVolume)
    const roi = calculateFunnelRoi({
      callsPerWeek,
      averageSale: config.averageSale,
      missedCallRate: config.missedCallRate,
    })
    const score = calculateLeadScore(values, config.leadScoring)

    const result = await submitLead({
      industry: config.slug,
      responses: values,
      score,
      roiSnapshot: {
        callsPerWeek,
        missedRevenuePerMonth: roi.missedRevenuePerMonth,
        recoveredRevenuePerMonth: roi.recoveredRevenuePerMonth,
      },
    })

    if (result.ok) {
      saveFunnelTrialContext({
        industry: config.slug,
        displayName: config.displayName,
        contactName: values.contactName?.trim() || undefined,
        contactEmail: values.contactEmail?.trim() || undefined,
        contactPhone: values.contactPhone?.trim() || undefined,
        leadId: result.leadId,
      })
    }
  }

  const trialHref = buildFunnelTrialStartUrl(config.slug)
  const subscribeHref = funnelSubscribeUrl(config.slug)

  const heroImage = config.heroImage ?? ""
  const heroAlt = getIndustryImageAlt(config.displayName)

  return (
    <div className="flex flex-col">
      <SectionBackdrop
        src={heroImage}
        alt={heroAlt}
        overlay="hero"
        priority
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20"
        contentClassName="container mx-auto text-center max-w-3xl"
      >
        <p className="text-sm font-medium text-primary mb-3">
          {config.icon} Built for {config.displayName}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{config.headline}</h1>
        <p className="text-lg text-muted-foreground mb-4">{config.subheadline}</p>
        <p className="text-sm text-destructive/90 font-medium mb-6">{config.painPoint}</p>
        <p className="text-sm text-muted-foreground">
          Avg {config.displayName.toLowerCase()} job: {formatCurrency(config.averageSale)}
        </p>
      </SectionBackdrop>

      <section className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <FunnelRoiCalculator config={config} callVolume={values.callVolume} />
          {!submitted ? (
            <FunnelStepForm
              config={config}
              values={values}
              onChange={handleChange}
              onComplete={handleComplete}
              submitting={submitting}
            />
          ) : (
            <Card className="border-primary/30 bg-primary/5 backdrop-blur">
              <CardContent className="pt-8 pb-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">You&apos;re all set!</h3>
                <p className="text-muted-foreground mb-6">
                  Your personalized ROI snapshot is ready. Subscribe to go live today, or start a
                  free trial with no card.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild onClick={() => trackFunnelConversion(config.slug, "subscribe")}>
                    <Link href={subscribeHref}>
                      Subscribe — 30-day guarantee
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild onClick={() => trackFunnelConversion(config.slug, "trial")}>
                    <Link href={trialHref}>Free trial (no card)</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {error && (
          <p className="text-center text-destructive text-sm mt-4" role="alert">
            {error}
          </p>
        )}
      </section>

      <FunnelDemoSection config={config} />

      {config.testimonial && <FunnelTestimonial testimonial={config.testimonial} />}

      <FunnelPricingCta
        config={config}
        onCtaClick={() => trackFunnelConversion(config.slug, config.cta.type)}
      />
    </div>
  )
}
