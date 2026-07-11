import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import { trialDaysLabel, trialConversionLine, trialNavCtaLabel } from "@/lib/trial-marketing"
import {
  ArrowRight,
  Clock,
  CreditCard,
  PhoneOff,
  Shield,
  TrendingUp,
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
      <BrandMark size="lg" className="mb-6 justify-center drop-shadow-sm" />
      <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-destructive mb-4">
        <PhoneOff className="h-4 w-4" aria-hidden />
        When you miss a call, 80% of callers hang up — and dial your competitor
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        Stop Losing Jobs to{" "}
        <span className="text-gradient-hero">Missed Calls</span>
      </h1>
      <p className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-4">
        We answer when you can&apos;t and text you the lead in seconds.
      </p>
      <div className="mb-6 inline-flex items-start gap-2 rounded-lg border border-primary/30 bg-background/60 backdrop-blur-sm px-4 py-3 text-sm sm:text-base text-left max-w-3xl mx-auto">
        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
        <span className="text-foreground/90">{trialConversionLine()}</span>
      </div>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto px-1">
        Most callers won&apos;t leave a message. Live answering captures 80–95% of those
        calls — vs. 5–15% for voicemail. Built for HVAC, plumbing, electrical, and auto
        repair.
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <Link href="/sign-up?next=%2Ftrial%2Fstart" className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            className="gap-2 text-base px-6 sm:px-8 shadow-lg shadow-primary/30 min-h-[44px]"
          >
            {trialNavCtaLabel()}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
        <Link href="#demo" className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/20 bg-background/40 backdrop-blur-sm hover:bg-background/60 min-h-[44px]"
          >
            Try a demo call
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        <Link href="/pricing" className="text-primary/90 hover:text-primary hover:underline">
          See plans &amp; pricing
        </Link>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary/80" aria-hidden />
          {trialDaysLabel()} free trial
        </span>
        <span className="inline-flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary/80" aria-hidden />
          No card required
        </span>
        <span className="inline-flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary/80" aria-hidden />
          Cancel anytime
        </span>
      </div>
    </SectionBackdrop>
  )
}
