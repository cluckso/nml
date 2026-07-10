import Link from "next/link"
import type { Metadata } from "next"
import { MID_AND_HIGH_VOLUME_LABEL, PLAN_MID_VOLUME, PLAN_HIGH_VOLUME } from "@/lib/plan-labels"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SMSPreview } from "@/components/marketing/SMSPreview"
import { DemoUnlock } from "@/components/marketing/DemoUnlock"
import { HomeHero } from "@/components/marketing/HomeHero"
import { IndustryPhotoCards } from "@/components/marketing/IndustryPhotoCards"
import { SectionBackdrop } from "@/components/marketing/SectionBackdrop"
import { TrustStrip } from "@/components/marketing/TrustStrip"
import { MobileAppDownload } from "@/components/marketing/MobileAppDownload"
import { MARKETING_IMAGES, MARKETING_IMAGE_ALT } from "@/lib/marketing-images"
import { formatJobRoiLine, formatOverageRate, formatIncludedUsageShort, formatCostPerCapturedCall, formatAvgJobValueRange, PRICING_TIERS } from "@/lib/pricing-catalog"
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
import { softwareApplicationJsonLd } from "@/lib/structured-data"
import { homePageMetadata } from "@/lib/seo"
import { trialHeadlineLabel, trialWithNoCardSentence } from "@/lib/trial-marketing"

export const metadata: Metadata = homePageMetadata()

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={softwareApplicationJsonLd()} />
      <HomeHero />
      <TrustStrip />

      {/* From first ring to lead — outcome narrative */}
      <SectionBackdrop
        src={MARKETING_IMAGES.workflow}
        alt={MARKETING_IMAGE_ALT.workflow}
        overlay="medium"
        imageClassName="object-cover object-center"
        className="border-y border-border/50 py-16"
        contentClassName="container mx-auto px-4"
      >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            From first ring to qualified lead
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            CallGrabbr answers the call, qualifies the lead, and delivers the details straight to your phone — so you can stay on the job.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <Zap className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Built for your trade</h3>
              <p className="text-sm text-muted-foreground">
                Intake tuned for HVAC, plumbing, electrical, auto repair, handyman, and more — not a generic script.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <MessageSquare className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Captures what matters</h3>
              <p className="text-sm text-muted-foreground">
                Name, phone, service need, urgency, and preferred time when shared. Appointment booking on {MID_AND_HIGH_VOLUME_LABEL}.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <LayoutDashboard className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Delivers to you instantly</h3>
              <p className="text-sm text-muted-foreground">
                Summaries by email and SMS. CRM webhook on {MID_AND_HIGH_VOLUME_LABEL}. You own every lead.
              </p>
            </div>
          </div>
      </SectionBackdrop>

      {/* Stats strip — one story: miss → hang up → you get the lead */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <div>
            <p className="text-2xl font-bold text-destructive">28%</p>
            <p className="text-sm text-muted-foreground">of calls go unanswered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">80%</p>
            <p className="text-sm text-muted-foreground">hang up — no message</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">Seconds</p>
            <p className="text-sm text-muted-foreground">from call to lead text</p>
          </div>
        </div>
      </section>

      {/* Features — Every call picked up */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Missed calls answered. Leads captured.</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          When you&apos;re on a job or the shop is closed, CallGrabbr takes over — so callers talk to someone instead of hanging up.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Phone className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Instant pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Forwarded calls answered in seconds. Spam and robocalls filtered before your assistant picks up.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Zap className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Trade-ready intake</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Questions tailored to your trade. Industry-specific flows on {MID_AND_HIGH_VOLUME_LABEL}. Emergency routing when needed.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Calendar className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Booking &amp; leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Qualified leads with name, phone, and details. Appointment booking on {MID_AND_HIGH_VOLUME_LABEL}.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Link2 className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Syncs to you</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email and SMS summaries. CRM webhook on {MID_AND_HIGH_VOLUME_LABEL}. Works with your existing number.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why This Matters */}
      <SectionBackdrop
        src={MARKETING_IMAGES.whyMatters}
        alt={MARKETING_IMAGE_ALT.whyMatters}
        overlay="medium"
        imageClassName="object-cover object-[75%_center]"
        className="py-16 border-y border-border/50"
        contentClassName="container mx-auto px-4"
      >
          <h2 className="text-3xl font-bold text-center mb-4">Why this matters</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto list-none text-center">
            <li className="text-muted-foreground">
              Most local service businesses miss <strong className="text-foreground">20–40% of inbound calls</strong>
            </li>
            <li className="text-muted-foreground">
              One missed call often means a <strong className="text-foreground">{formatAvgJobValueRange()} lost job</strong>
            </li>
            <li className="text-muted-foreground">
              After-hours callers are usually <strong className="text-foreground">ready to book</strong>
            </li>
          </ul>
          <p className="text-center font-medium mt-8 text-primary">
            Capture one job you would have lost — and the service pays for itself for months
          </p>
      </SectionBackdrop>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Live in about five minutes. Four steps from signup to your first captured lead.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <PhoneForwarded className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Connect your number</h3>
            <p className="text-muted-foreground text-sm">
              Forward your business line — or use a new one. Keep the number customers already know.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Pick your trade</h3>
            <p className="text-muted-foreground text-sm">
              HVAC, plumbing, electrical, handyman, auto, and more — so intake asks the right questions.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Calls get answered</h3>
            <p className="text-muted-foreground text-sm">
              We pick up when you can&apos;t, qualify the caller, and capture the details you need.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">4. You get the lead</h3>
            <p className="text-muted-foreground text-sm">
              SMS and email summary with captured details. CRM webhook on {MID_AND_HIGH_VOLUME_LABEL}.
            </p>
          </div>
        </div>
        <p className="text-center mt-8">
          <Link href="/docs/faq" className="text-sm font-medium text-primary hover:underline">
            See setup guide by carrier →
          </Link>
        </p>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <DemoUnlock />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="border-y border-border/50 bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Works with the tools you use</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
            Lead summaries go where you already work. No new stack required.
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
              <span className="font-medium">CRM webhook</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Calendar className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Appointments ({PLAN_MID_VOLUME} & {PLAN_HIGH_VOLUME})</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Phone className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Your existing phone</span>
            </div>
          </div>
        </div>
      </section>

      <MobileAppDownload />

      {/* What Callers Hear */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">What your callers experience</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Professional, friendly, and fast — so they stay on the line instead of calling the next shop.
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
                <p>Your assistant asks relevant questions for your trade and captures the details you need to follow up.</p>
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
                  Honest when asked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Sounds natural in conversation — and identifies as an automated assistant if asked directly.</p>
                <p>Calls may be recorded for quality. You control the settings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Receive — with SMS preview */}
      <SectionBackdrop
        src={MARKETING_IMAGES.leadCapture}
        alt={MARKETING_IMAGE_ALT.leadCapture}
        overlay="medium"
        imageClassName="object-cover object-[30%_center]"
        className="py-16 border-y border-border/50"
        contentClassName="container mx-auto px-4"
      >
          <h2 className="text-3xl font-bold text-center mb-3">What happens after a completed call?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            You get a clean lead summary by text or email — or sent straight to your CRM — usually within seconds.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            {/* SMS Preview */}
            <SMSPreview />
            
            {/* Feature list */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Every completed call can include:</h3>
              <ul className="space-y-3 list-none">
                {[
                  "Caller name + phone number",
                  "Service requested",
                  "Problem description",
                  "Address / location",
                  "Urgency level",
                  "Preferred appointment time",
                  "Full call summary",
                  "Recording (optional)",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-6">
                CRM delivery available on {MID_AND_HIGH_VOLUME_LABEL} plans.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Spam and robocalls filtered when possible — so alerts focus on real leads.
              </p>
            </div>
          </div>
      </SectionBackdrop>

      <AudioExamples />

      {/* Built for Local Service Businesses */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Built for local service businesses</h2>
        <p className="text-center text-muted-foreground mb-10">
          If customers call you when they need help — this fits.
        </p>
        <IndustryPhotoCards />
      </section>

      {/* Pricing — ROI-first framing */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-3">
            Coverage for the calls you&apos;d otherwise lose
          </h2>
          <p className="text-center text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
            {formatJobRoiLine()} No setup fees. Overage {formatOverageRate()} only if you exceed included calls.
            Cancel anytime.
          </p>
          <p className="text-center text-sm text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            Most one-truck shops start on Solo Owner. Upgrade when you need every inbound call answered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.key}
                className={
                  tier.popular
                    ? "border-primary/50 bg-primary/5 border-2"
                    : "glass-card"
                }
              >
                <CardHeader className="space-y-2">
                  {tier.badge && (
                    <span
                      className={`mb-1 inline-block w-fit rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                        tier.badge === "Best to start"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : tier.badge === "Growing shops"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <CardTitle className="text-xl tracking-tight">
                    {tier.name}
                    <span className="block text-base font-semibold text-muted-foreground mt-1">
                      ${tier.price}/month
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.subtitle}</p>
                  <p className="text-sm font-medium text-foreground/90 leading-snug">
                    {formatIncludedUsageShort(tier.includedMinutes)}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {formatCostPerCapturedCall(tier.price, tier.includedMinutes)}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tier.usageNote}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {tier.features.map((f) => (
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
            <Link href="/pricing">
              <Button size="lg" className="gap-2">
                See full pricing &amp; start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Frequently asked questions</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Straight answers so you can decide with confidence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">“Does it sound natural?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes — clear conversation, no robot menus. Callers get help faster than leaving a message. If asked, it identifies as an automated assistant.
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
              <CardTitle className="text-base">“Do I need new software?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No. Keep your business phone and forward calls. Summaries go to email, SMS, and optional CRM.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How fast can I get set up?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                About five minutes. Sign up, add your business phone, and set call forwarding. Carrier steps are in Help.
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
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">{trialHeadlineLabel()}</p>
              <p className="text-sm text-muted-foreground">Test with real calls</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">No card required</p>
              <p className="text-sm text-muted-foreground">Start risk-free</p>
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
            Average job value for contractors: <strong className="text-foreground">{formatAvgJobValueRange()}</strong>.
            Capture just one job from a missed call, and the service pays for itself for months.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <SectionBackdrop
        src={MARKETING_IMAGES.finalCta}
        alt={MARKETING_IMAGE_ALT.finalCta}
        overlay="heavy"
        imageClassName="object-cover object-[center_65%]"
        className="py-20"
        contentClassName="container mx-auto px-4 text-center"
      >
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-primary/90 backdrop-blur-md px-6 py-12 sm:px-10 text-primary-foreground shadow-2xl shadow-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn missed calls into paying jobs</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            We answer when you can&apos;t, capture the lead, and text you the details — usually within seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="opacity-90">{trialHeadlineLabel()}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">No card required</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">Cancel anytime</span>
          </div>
          <Link href="/sign-up?next=%2Ftrial%2Fstart">
            <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg min-h-[48px] px-8">
              Start your free trial
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
          <p className="text-sm opacity-80 mt-6">
            Setup in about five minutes. Use your existing business number.
          </p>
        </div>
      </SectionBackdrop>
    </div>
  )
}
