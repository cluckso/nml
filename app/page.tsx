import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { SMSPreview } from "@/components/marketing/SMSPreview"
import { DemoUnlock } from "@/components/marketing/DemoUnlock"
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
  TrendingUp,
  PhoneOff,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(217_91%_60%_/_.15),transparent)]" />
        <div className="container relative z-10 mx-auto text-center max-w-4xl">
          {/* Proof stat badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive mb-4">
            <PhoneOff className="h-4 w-4" />
            80% of callers won&apos;t leave voicemail — they call the next business
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Stop Losing Jobs to Voicemail
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-4">
            We answer when you can&apos;t and text you the lead in seconds.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto px-1">
            Voicemail captures 5–15% of callers. AI answering captures 80–95%. From first ring to qualified lead — no hold music, no robot menus. You get name, phone, job details, and urgency by text and email.
          </p>
          <p className="text-sm text-muted-foreground/90 mb-8 max-w-xl mx-auto">
            Built for HVAC, plumbing, electrical, and auto repair shops.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href="/sign-up" className="min-h-[44px] flex items-center">
              <Button size="lg" className="gap-2 text-base px-6 sm:px-8 shadow-lg shadow-primary/25 min-h-[44px]">
                Start free trial
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
            <Link href="#demo" className="min-h-[44px] flex items-center">
              <Button size="lg" variant="outline" className="border-2 border-muted-foreground/40 bg-transparent hover:bg-white/5 min-h-[44px]">
                Test the AI
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary/80" aria-hidden />
              7-day free trial
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
          {/* Conversion stat */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-muted-foreground">Study of 130,000+ calls:</span>
            <span className="font-semibold text-foreground">AI captures 80–95% vs voicemail&apos;s 5–15%</span>
          </div>
        </div>
      </section>

      {/* From first ring to lead — outcome narrative */}
      <section className="border-y border-border/50 bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            From first ring to qualified lead.
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            CallGrabbr handles the full flow: answer every call, qualify the lead, and deliver the details straight to you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <Zap className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Built for your industry</h3>
              <p className="text-sm text-muted-foreground">
                Intake flows tuned for HVAC, plumbing, electrical, auto repair, handyman, and more. No generic scripts.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <MessageSquare className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Captures every lead</h3>
              <p className="text-sm text-muted-foreground">
                Name, phone, service need, urgency, and preferred time. Appointment booking on higher tiers.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <LayoutDashboard className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-lg mb-2">Delivers to your stack</h3>
              <p className="text-sm text-muted-foreground">
                Summaries by email and SMS. Optional CRM webhook. No data lock-in — you own the leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <div>
            <p className="text-2xl font-bold text-destructive">28%</p>
            <p className="text-sm text-muted-foreground">Calls go unanswered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">80%</p>
            <p className="text-sm text-muted-foreground">Won&apos;t leave voicemail</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">Seconds</p>
            <p className="text-sm text-muted-foreground">Lead to your phone</p>
          </div>
        </div>
      </section>

      {/* Features — Every call picked up */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Every call picked up. Every lead captured.</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          When the line is busy or the office is closed, CallGrabbr takes over — no more voicemail black holes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Phone className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Instant pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every call answered in seconds. Spam and robocalls filtered before the AI picks up.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Zap className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Industry flows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Questions and intake tailored to your trade. Emergency routing when needed.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Calendar className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Booking & leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Appointment booking on Growth and Scale. Qualified leads with name, phone, and details.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <Link2 className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-base">Syncs to you</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email and SMS summaries. CRM webhook. Your calendar. Works with your existing phone number.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Why This Matters</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto list-none text-center">
            <li className="text-muted-foreground">
              Most local service businesses miss <strong className="text-foreground">20–40% of inbound calls</strong>
            </li>
            <li className="text-muted-foreground">
              One missed call often = <strong className="text-foreground">$150–$600 lost job</strong>
            </li>
            <li className="text-muted-foreground">
              After-hours calls are usually <strong className="text-foreground">high intent</strong>
            </li>
          </ul>
          <p className="text-center font-medium mt-8 text-primary">
            Recover just 2 jobs per month → service pays for itself
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Get from first ring to qualified lead in four steps.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <PhoneForwarded className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 1 — Connect Your Number</h3>
            <p className="text-muted-foreground text-sm">
              Forward your business line or use a new one.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 2 — Pick Your Industry Flow</h3>
            <p className="text-muted-foreground text-sm">
              HVAC, plumbing, electrical, handyman, auto, and more.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 3 — Every call gets answered</h3>
            <p className="text-muted-foreground text-sm">
              Intake, questions, and scheduling handled automatically.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Step 4 — You Get the Lead Instantly</h3>
            <p className="text-muted-foreground text-sm">
              SMS + email + CRM push with full summary.
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
              <span className="font-medium">Your calendar</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-5 py-3">
              <Phone className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">Your existing phone</span>
            </div>
          </div>
        </div>
      </section>

      {/* What Callers Hear — AI disclosure */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">What your callers experience</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Professional, friendly, and fast. No robot menus. No hold music.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Natural conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Callers hear a friendly, professional voice — not a robot menu.</p>
                <p>The AI asks relevant questions based on your industry (plumbing, HVAC, electrical, etc.) and captures the details you need.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Quick and helpful
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>No &quot;press 1 for sales&quot; — callers explain their problem and get acknowledged.</p>
                <p>Average call time: under 2 minutes. Fast for them, detailed for you.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Emergency routing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Urgent calls can be flagged or routed based on your settings.</p>
                <p>You set the rules: what counts as emergency, who gets notified, when to escalate.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>The AI identifies itself as an assistant if asked directly.</p>
                <p>Calls may be recorded for quality and training. You control the settings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Receive — with SMS preview */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">What you get after every call</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Seconds after the call ends, you receive everything you need to call back and close the job.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            {/* SMS Preview */}
            <SMSPreview />
            
            {/* Feature list */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Every lead includes:</h3>
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
                Delivered by <strong className="text-foreground">SMS + email + CRM webhook</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Spam and robocalls filtered automatically — you only see real leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AudioExamples />

      {/* Built for Local Service Businesses */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Built for Local Service Businesses</h2>
        <p className="text-center text-muted-foreground mb-10">Ideal for:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
          {["HVAC", "Plumbing", "Electrical", "Auto repair", "Handyman", "Cleaning", "Landscaping", "Home services"].map((name) => (
            <div key={name}>
              <span className="font-semibold">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-8">If customers call you — this fits.</p>
      </section>

      {/* Pricing (Simple and Predictable) */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Simple, predictable pricing</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            No setup fees. No hidden charges. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Starter — $99/mo</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">Best for solo operators · 300 included min/mo</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "300 included minutes/month",
                  "24/7 call answering",
                  "Spam call filtering",
                  "Name, phone, reason captured",
                  "Email summaries",
                  "No setup fee",
                ].map((f, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card className="border-primary/50 bg-primary/5 border-2">
              <CardHeader>
                <CardTitle>Growth — $149/mo</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">Best for growing shops · 900 included min/mo</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "900 included minutes/month",
                  "Spam call filtering",
                  "Industry intake flows",
                  "Appointment + emergency logic",
                  "CRM + SMS notifications",
                  "Lead tagging",
                ].map((f, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Scale — $249/mo</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">Best for high-volume trades · 1,800 included min/mo</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "1,800 included minutes/month",
                  "Spam call filtering",
                  "Custom branded voice",
                  "After-hours emergency handling",
                  "Weekly usage reports",
                  "Priority support",
                ].map((f, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">Start with a 7-day free trial. No card required.</p>
            <Link href="/pricing">
              <Button size="lg" className="gap-2">
                See full pricing & start free trial
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
          Quick answers so you can get started with confidence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">“Does it sound like a real person?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes. Natural conversation, no robot menus. Callers get answers faster than voicemail.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">“What if the caller wants a human?”</CardTitle>
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
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">“Do I need new software?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No. Use your existing business phone and forward calls. Summaries go to email, SMS, and optional CRM.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How fast can I get set up?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                About 5 minutes. Sign up, add your business phone, and set call forwarding. See our Help guide for carrier steps.
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

      {/* Mistakes to Avoid */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Mistakes to Avoid (Most Shops Do This)</h2>
          <ul className="inline-block text-left list-none space-y-2 text-muted-foreground">
            {[
              "Letting calls go to voicemail",
              "Relying only on daytime staff",
              "Missing after-hours emergencies",
              "Losing weekend leads",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-destructive font-medium">×</span> {item}
              </li>
            ))}
          </ul>
          <p className="font-medium mt-6 text-foreground">Each one costs real money.</p>
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
              <p className="font-medium">7-day free trial</p>
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
            Average job value for contractors: <strong className="text-foreground">$350–$600</strong>. 
            Capture just one job from a missed call, and the service pays for itself for months.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn your phone into a 24/7 lead machine</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Stop losing jobs to voicemail. Get every call answered, every lead captured, and every summary in your inbox in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="opacity-90">7-day free trial</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">No card required</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">Cancel anytime</span>
          </div>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg min-h-[48px] px-8">
              Start your free trial
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
          <p className="text-sm opacity-80 mt-6">
            Setup in 5 minutes. Use your existing business number.
          </p>
        </div>
      </section>
    </div>
  )
}
