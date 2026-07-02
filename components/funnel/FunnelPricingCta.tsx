"use client"

import Link from "next/link"
import type { FunnelConfig } from "@/lib/funnel/funnel-config"
import { getFunnelCtaHref } from "@/lib/funnel/industry-configs"
import { PRICING_TIERS } from "@/lib/pricing-catalog"
import { formatCurrency } from "@/lib/industry-data"
import { trialDaysLabel, moneyBackGuaranteeLabel } from "@/lib/trial-marketing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"

interface FunnelPricingCtaProps {
  config: FunnelConfig
  onCtaClick?: () => void
  className?: string
}

export function FunnelPricingCta({ config, onCtaClick, className = "" }: FunnelPricingCtaProps) {
  const href = getFunnelCtaHref(config)
  const isExternal = href.startsWith("http")
  const starter = PRICING_TIERS[0]

  return (
    <section className={`container mx-auto px-4 py-12 ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to stop losing {config.displayName.toLowerCase()} leads?</h2>
        <p className="text-muted-foreground mb-8">
          {moneyBackGuaranteeLabel()} · {trialDaysLabel()} free trial · Plans from {formatCurrency(starter.price)}/mo
        </p>

        <Card className="border-border/50 bg-card/60 backdrop-blur text-left mb-8">
          <CardHeader>
            <CardTitle className="text-lg">{starter.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {starter.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-3">
          {isExternal ? (
            <Button size="lg" asChild onClick={onCtaClick}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                {config.cta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="lg" asChild onClick={onCtaClick}>
              <Link href={href}>
                {config.cta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link href={`/sign-up?next=${encodeURIComponent(href)}`}>
              Create account
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/trial/start?from=funnel&industry=${config.slug}`}>Free trial (no card)</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
