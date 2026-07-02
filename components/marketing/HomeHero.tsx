import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import { pricingUrl } from "@/lib/monetization-urls"
import { PlanType } from "@prisma/client"
import { trialDaysLabel } from "@/lib/trial-marketing"
import {
  ArrowRight,
  Clock,
  CreditCard,
  PhoneOff,
  Shield,
  TrendingUp,
} from "lucide-react"

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
      <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-destructive mb-4">
        <PhoneOff className="h-4 w-4" aria-hidden />
        80% of callers won&apos;t leave voicemail — they call the next business
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        Stop Losing Jobs to{" "}
        <span className="text-gradient-hero">Voicemail</span>
      </h1>
      <p className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-4">
        We answer when you can&apos;t and text you the lead in seconds.
      </p>
      <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto px-1">
        Voicemail captures 5–15% of callers. Live answering captures 80–95%. From first ring to
        qualified lead — no hold music, no robot menus. Captured details are sent by text and email when the caller shares them.
      </p>
      <p className="text-sm text-muted-foreground/90 mb-8 max-w-xl mx-auto">
        Built for HVAC, plumbing, electrical, and auto repair shops. Plans from $99/mo.
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <Link href="/sign-up" className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            className="gap-2 text-base px-6 sm:px-8 shadow-lg shadow-primary/30 min-h-[44px]"
          >
            Start free trial
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
        <Link href={pricingUrl({ intent: "paid", plan: PlanType.PRO })} className="min-h-[44px] flex items-center">
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-base px-6 sm:px-8 min-h-[44px]"
          >
            Subscribe from $99/mo
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
      <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-background/50 backdrop-blur-sm px-4 py-2 text-sm">
        <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-muted-foreground">Study of 130,000+ calls:</span>
        <span className="font-semibold text-foreground">
          Live answering captures 80–95% vs voicemail&apos;s 5–15%
        </span>
      </div>
    </SectionBackdrop>
  )
}
