import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import {
  CARRIER_SETUP_HREF,
  moneyBackGuaranteeLabel,
  phoneDemoCtaLabel,
  plansFromAnchorLabel,
  setupReassuranceLine,
  trialNavCtaLabel,
  trialTrustLine,
} from "@/lib/trial-marketing"
import {
  HERO_CATEGORY_LINE,
  HERO_SUB,
  HANGUP_RATE_LABEL,
  LOSS_CTA,
} from "@/lib/marketing/positioning"
import { getDemoNumberDisplay, getDemoNumberTel } from "@/lib/demo-line"
import {
  ArrowRight,
  PhoneOff,
} from "lucide-react"
import { BrandMark } from "@/components/brand/BrandMark"

export function HomeHero() {
  return (
    <SectionBackdrop
      src={MARKETING_IMAGES.hero}
      alt={MARKETING_IMAGE_ALT.hero}
      overlay="hero"
      priority
      imageClassName="object-cover object-[70%_center]"
      className="min-h-[88vh] flex flex-col items-center justify-center px-4 py-24"
      contentClassName="container mx-auto text-center max-w-4xl"
    >
      <div className="mb-8 flex w-full justify-center">
        <BrandMark size="xl" className="drop-shadow-sm" />
      </div>
      <p className="text-sm sm:text-base font-medium text-foreground/90 mb-4">
        {HERO_CATEGORY_LINE}
      </p>
      <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-destructive">
        <PhoneOff className="h-4 w-4" aria-hidden />
        {HANGUP_RATE_LABEL}
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight">
        Stop Losing Jobs to{" "}
        <span className="text-gradient-hero">Missed Calls</span>
      </h1>
      <p className="text-lg sm:text-xl text-foreground/90 mb-3 max-w-2xl mx-auto leading-relaxed">
        You&apos;re on a job. The phone rings. You can&apos;t pick up. They hang up —
        and call the next guy on the list.
      </p>
      <p className="text-xl sm:text-2xl font-semibold text-foreground/95 mb-8 max-w-2xl mx-auto">
        {HERO_SUB}
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <Link href="/sign-up?next=%2Ftrial%2Fstart" className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            className="gap-2 text-base px-6 sm:px-8 shadow-lg shadow-primary/30 min-h-[44px]"
          >
            {trialNavCtaLabel()}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
        <Link href="#lost-jobs" className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/20 bg-background/40 backdrop-blur-sm hover:bg-background/60 min-h-[44px]"
          >
            {LOSS_CTA}
          </Button>
        </Link>
      </div>
      <a
        href={`tel:${getDemoNumberTel()}`}
        className="mb-6 inline-flex flex-col items-center rounded-2xl border border-primary/40 bg-background/70 px-6 py-4 backdrop-blur-sm hover:border-primary/70 hover:bg-background/80"
      >
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {phoneDemoCtaLabel()}
        </span>
        <span className="text-2xl sm:text-3xl font-bold tracking-wide text-primary">
          {getDemoNumberDisplay()}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Tap to call · 60-second sample · no signup
        </span>
      </a>
      <p className="text-sm text-muted-foreground mb-2 max-w-xl mx-auto">
        {trialTrustLine()} · {moneyBackGuaranteeLabel()}
      </p>
      <p className="text-sm text-muted-foreground mb-2 max-w-xl mx-auto">
        {setupReassuranceLine()}{" "}
        <Link href={CARRIER_SETUP_HREF} className="text-primary/90 hover:text-primary hover:underline">
          Carrier setup guide
        </Link>
      </p>
      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
        <Link href="/pricing" className="text-primary/90 hover:text-primary hover:underline">
          {plansFromAnchorLabel()} · compare plans
        </Link>
      </p>
    </SectionBackdrop>
  )
}
