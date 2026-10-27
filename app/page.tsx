import Link from "next/link"
import type { Metadata } from "next"
import { GROWTH_AND_PLATINUM_LABEL, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SMSPreview } from "@/components/marketing/SMSPreview"
import { DemoUnlock } from "@/components/marketing/DemoUnlock"
import { HomeHero } from "@/components/marketing/HomeHero"
import { LostJobsMath } from "@/components/marketing/LostJobsMath"
import { IndustryPhotoCards } from "@/components/marketing/IndustryPhotoCards"
import { JtbdOutcomes } from "@/components/marketing/JtbdOutcomes"
import { BeforeAfterCall } from "@/components/marketing/BeforeAfterCall"
import { CompareUsLinks } from "@/components/marketing/CompareUsLinks"
import { TrustStrip } from "@/components/marketing/TrustStrip"
import { MobileAppDownload } from "@/components/marketing/MobileAppDownload"
import { TradeIntakeCompare } from "@/components/marketing/TradeIntakeCompare"
import { formatJobValuePromptLine, PRICING_TIERS } from "@/lib/pricing-catalog"
import {
  ArrowRight,
  CreditCard,
  Clock,
  PhoneForwarded,
  LayoutDashboard,
  Check,
  Zap,
  Shield,
  MessageSquare,
  Mail,
  Calendar,
  Link2,
  Phone,
} from "lucide-react"

import { JsonLd } from "@/components/seo/JsonLd"
import { PRODUCT_FAQ } from "@/lib/faq-data"
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "@/lib/structured-data"
import { homePageMetadata } from "@/lib/seo"
import {
  basicVsGrowthFitLine,
  moneyBackGuaranteeLabel,
  plansFromAnchorLabel,
  siteMetaDescription,
  trialDisclosureLine,
  trialHeadlineLabel,
  trialNavCtaLabel,
  trialTrustLine,
  trialWithNoCardSentence,
} from "@/lib/trial-marketing"

export const metadata: Metadata = homePageMetadata()

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd
        data={[
          softwareApplicationJsonLd(),
          webPageJsonLd({
            name: "CallGrabbr - Stop Losing Jobs to Missed Calls",
            description: siteMetaDescription(),
            path: "/",
          }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }]),
          faqPageJsonLd(PRODUCT_FAQ.slice(0, 8)),
        ]}
      />
      <HomeHero />
      <TrustStrip />
      <nav
        aria-label="Popular resources"
        className="container mx-auto px-4 py-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
      >
        <Link href="/guides" className="hover:text-primary underline-offset-2 hover:underline">
          Guides
        </Link>
        <Link href="/docs/faq" className="hover:text-primary underline-offset-2 hover:underline">
          Help &amp; FAQ
        </Link>
        <Link href="/pricing" className="hover:text-primary underline-offset-2 hover:underline">
          Pricing
        </Link>
        <Link href="/compare" className="hover:text-primary underline-offset-2 hover:underline">
          Compare
        </Link>
      </nav>

      <section
        id="demo"
        className="scroll-mt-24 bg-muted/30 py-16 border-y border-border/50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <DemoUnlock />
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-background">
        <LostJobsMath />
      </section>

      {/* What you get isn't a transcript — it's a lead */}
      <section id="features" className="scroll-mt-24 py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3">
          What you get isn&apos;t a transcript — it&apos;s a lead
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Name, phone, job, urgency, and a tap-to-call-back — in seconds. Feels like a CRM ping, not a
          dump of words.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          <SMSPreview />
          <div>
            <h3 className="text-xl font-semibold mb-6">Every captured job can include:</h3>
            <ul className="space-y-3 list-none">
              {[
                "Caller name + phone number",
                "Service requested / job type",
                "Problem description",
                "Address / location",
                "Urgency level",
                "Preferred appointment time",
                "Full call summary",
                "Recording (optional)",
                "Text-back confirmation to callers so they don't dial the next shop while you're still on a job.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-6">
              CRM delivery available on {GROWTH_AND_PLATINUM_LABEL} plans. Spam and robocalls filtered
              so alerts focus on real leads.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-24 container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Setup takes minutes — sign up, enter some details, attach your phone using our setup guide.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Sign up</h3>
            <p className="text-muted-foreground text-sm">
              Create your account and start the free trial — no card required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Add your business</h3>
            <p className="text-muted-foreground text-sm">
              Enter your business phone and trade so we tune intake for HVAC, plumbing, auto, and more.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <PhoneForwarded className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Get your forwarding number</h3>
            <p className="text-muted-foreground text-sm">
              Keep the number customers already know. We give you a line to catch the calls you miss.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">4. Forward &amp; catch leads</h3>
            <p className="text-muted-foreground text-sm">
              Set call forwarding at your carrier. We answer when you can&apos;t and text you the lead — name, phone, job, and urgency.
            </p>
          </div>
        </div>
        <p className="text-center mt-8">
          <Link href="/docs/faq#call-forwarding" className="text-sm font-medium text-primary hover:underline">
            See setup guide by carrier →
          </Link>
        </p>
      </section>

      <TradeIntakeCompare />

      {/* Insurance-tier plan teaser */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-3">
            Plans that grow with your shop
          </h2>
          <p className="text-center text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
            Same product on every plan — more minutes and tools as your volume grows.
          </p>
          <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
            {basicVsGrowthFitLine()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <Card key={tier.key} className={tier.popular ? "border-primary/50 bg-primary/5 border-2" : "glass-card"}>
                <CardHeader className="space-y-2">
                  {tier.badge && (
                    <span
                      className={`mb-1 inline-block w-fit rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                        tier.badge === "Lead insurance" || tier.badge === "Best to start"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : tier.badge === "Most popular" || tier.badge === "Full coverage" || tier.popular
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <CardTitle className="text-xl tracking-tight">{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.subtitle}</p>
                  <p className="text-sm text-foreground/90 leading-snug">{tier.usageNote}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {tier.features.slice(0, 4).map((f) => (
                    <p key={f} className="text-sm text-muted-foreground flex items-start gap-2 leading-snug">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                      {f}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              {trialWithNoCardSentence()}
            </p>
            <Link href="/sign-up?next=%2Ftrial%2Fstart">
              <Button size="lg" className="gap-2">
                {trialNavCtaLabel()}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              <Link href="/pricing" className="text-primary hover:underline">
                {plansFromAnchorLabel()} · compare plans →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CompareUsLinks className="container mx-auto px-4 py-16" />

      {/* Integrations */}
      <section className="border-y border-border/50 bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Works with the tools you use</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
            Lead summaries go where you already work — email, SMS, or a CRM webhook into ServiceTitan,
            Housecall Pro, or Jobber. No new stack required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Mail className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Email</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <MessageSquare className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">SMS</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Link2 className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">ServiceTitan, Housecall Pro, Jobber</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Calendar className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Appointments ({PLAN_GROWTH} & {PLAN_PLATINUM})</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Phone className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Your existing phone</span>
            </div>
          </div>
        </div>
      </section>

      <MobileAppDownload />

      {/* Built for Local Service Businesses */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Built for local service businesses</h2>
        <p className="text-center text-muted-foreground mb-10">
          If customers call you when they need help — this fits.
        </p>
        <IndustryPhotoCards />
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mt-8">
          Built for HVAC, plumbing, electrical, auto repair, and other local trades — including
          one-truck shops and childcare.
        </p>
      </section>

      {/* Caller experience — demoted (mechanism / quality, not the product) */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">What your callers experience</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Professional and fast — so they stay on the line instead of dialing the next shop.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Natural conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Callers hear a clear, professional voice — not a robot menu or hold music.</p>
                <p>Trade-tuned questions capture the details you need to follow up and quote.</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Quick and helpful
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>No &quot;press 1 for sales.&quot; Callers explain their problem and get acknowledged.</p>
                <p>Most calls finish in under two minutes — fast for them, detailed for you.</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Emergency routing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Urgent calls can be flagged or routed based on your settings.</p>
                <p>You decide what counts as an emergency, who gets notified, and when to escalate.</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Clear and professional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Sounds natural in conversation — never a robot menu or hold music.</p>
                <p>You control recording and escalation settings from your dashboard.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AudioExamples />

      <BeforeAfterCall />
      <JtbdOutcomes />

      {/* FAQ — AI/honesty last */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Frequently asked questions</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Straight answers so you can decide with confidence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">“Do I need new software?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No. Keep your business phone and forward calls. Leads go to email, SMS, and an optional
                webhook into ServiceTitan, Housecall Pro, or Jobber.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How fast can I get set up?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Setup takes minutes — sign up, enter some details, attach your phone using our setup
                guide.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">“What if they want a person?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">You can set:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                <li>transfer rules</li>
                <li>escalation triggers</li>
                <li>emergency routing</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">“Is it AI?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes. An automated system answers when you can&apos;t, runs trade-tuned intake, and texts
                you the lead.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-center mt-8">
          <Link href="/docs/faq" className="text-sm font-medium text-primary hover:underline">
            Full help &amp; setup guide →
          </Link>
        </p>
      </section>

      {/* Cost of inaction */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">What quietly costs shops the most</h2>
          <ul className="inline-block text-left list-none space-y-2 text-muted-foreground">
            {[
              "Letting busy and after-hours calls go unanswered",
              "Hoping callers will leave a message (most won't)",
              "Missing weekend and emergency leads",
              "Finding out a competitor booked the job first",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-destructive font-medium">×</span> {item}
              </li>
            ))}
          </ul>
          <p className="font-medium mt-6 text-foreground">Each one is a job that walked away.</p>
        </div>
      </section>

      {/* Guarantee / Risk Reversal */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">One captured job pays for months of service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">{trialHeadlineLabel()}</p>
              <p className="text-sm text-muted-foreground">{trialDisclosureLine()}</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">No card required</p>
              <p className="text-sm text-muted-foreground">Start in under a minute</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">{moneyBackGuaranteeLabel()}</p>
              <p className="text-sm text-muted-foreground">On paid plans</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Cancel anytime</p>
              <p className="text-sm text-muted-foreground">No contract, no hassle</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {formatJobValuePromptLine()} Capture just one from a missed call, and the
            service pays for itself for months.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto rounded-2xl border border-primary/20 bg-primary px-6 py-12 sm:px-10 text-primary-foreground shadow-2xl shadow-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn missed calls into paying jobs</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            We grab the job when you can&apos;t and text you the lead in seconds.
          </p>
          <p className="text-sm opacity-90 max-w-2xl mx-auto mb-6">
            {trialTrustLine()} · {moneyBackGuaranteeLabel()}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="opacity-90">{plansFromAnchorLabel()}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">Cancel anytime</span>
          </div>
          <Link href="/sign-up?next=%2Ftrial%2Fstart">
            <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg min-h-[48px] px-8">
              {trialNavCtaLabel()}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
          <p className="text-sm opacity-80 mt-6">
            Setup takes minutes.{" "}
            <Link href="/pricing" className="underline underline-offset-2 opacity-100">
              Compare plans
            </Link>
          </p>
        </div>
        </div>
      </section>
    </div>
  )
}
