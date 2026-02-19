import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import {
  ArrowRight,
  CreditCard,
  Clock,
  PhoneForwarded,
  LayoutDashboard,
  Star,
  Quote,
  Check,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(217_91%_60%_/_.15),transparent)]" />
        <div className="container relative z-10 mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <PhoneForwarded className="h-4 w-4" />
            AI call answering for local service businesses
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            CallGrabbr — AI That Answers Every Call and Books the Job
          </h1>
          <p className="text-2xl font-semibold text-foreground/90 mb-4">
            Never miss another paying customer
          </p>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            When you don&apos;t answer, they call the next company. CallGrabbr answers every call,
            captures the lead, and sends you the job details instantly — 24/7. No voicemail. No hold
            music. No lost revenue.
          </p>
          <p className="text-primary font-medium mb-10">
            Turn missed calls into booked work automatically.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Free Trial — 50 Min or 4 Days
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-muted-foreground/40 bg-transparent hover:bg-white/5">
                View Pricing
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-4 w-4" />
              </span>
              No card required to start
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Clock className="h-4 w-4" />
              </span>
              5-minute setup
            </span>
          </div>
        </div>
      </section>

      {/* What This Does (Fast) */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">What This Does (Fast)</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Answers your business phone instantly and turns callers into leads.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto list-none">
          {[
            "Answers your business phone instantly",
            "Filters spam and robocall numbers before answering",
            "Talks naturally with callers",
            "Captures name, phone, service need, urgency",
            "Books appointments or sends qualified leads",
            "Texts and emails you the summary in seconds",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
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
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-12">
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
            <h3 className="font-semibold text-lg mb-2">Step 3 — Calls Get Answered Automatically</h3>
            <p className="text-muted-foreground text-sm">
              AI handles intake, questions, and scheduling.
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
        <p className="text-center mt-6">
          <Link href="/docs/faq" className="text-sm font-medium text-primary hover:underline">
            See setup guide →
          </Link>
        </p>
      </section>

      {/* What Callers Experience + What You Receive — two columns */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-6">What Callers Experience</h2>
              <ul className="space-y-2 list-none">
                {[
                  "No robot menus",
                  "No “press 1”",
                  "Natural conversation",
                  "Fast answers",
                  "Appointment capture",
                  "Emergency routing when needed",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">What You Receive</h2>
              <p className="text-muted-foreground mb-4">After every call:</p>
              <ul className="space-y-2 list-none">
                {[
                  "Caller name + number",
                  "Service requested",
                  "Problem description",
                  "Urgency level",
                  "Preferred time",
                  "Call summary",
                  "Spam numbers blocked automatically",
                  "Recording (optional)",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Delivered by <strong className="text-foreground">text + email + CRM webhook</strong>
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
          <h2 className="text-3xl font-bold text-center mb-4">Pricing (Simple and Predictable)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Starter — $99/mo</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">Best for solo operators</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "~75–120 calls/month",
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
                <p className="text-sm text-muted-foreground font-normal">Best for growing shops</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "~225–360 calls/month",
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
                <p className="text-sm text-muted-foreground font-normal">Best for high-volume trades</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "~450–720 calls/month",
                  "Spam call filtering",
                  "Branded AI voice",
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
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                See full pricing & start trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">“Will callers know it&apos;s AI?”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Usually no. It sounds like a trained front desk. And it&apos;s faster than voicemail.
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
                No. Works with your current phone + CRM.
              </p>
            </CardContent>
          </Card>
        </div>
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

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">What Business Owners Say</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Local service pros use CallGrabbr to answer every call and capture leads.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex gap-0.5 text-amber-500 mb-4" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground italic mb-6">
                &ldquo;Most days I&apos;m inside panels or on ladders and can&apos;t stop to answer the phone. Now every call gets answered and I get the details afterward. It&apos;s taken a lot of pressure off my day.&rdquo;
              </p>
              <p className="font-semibold">Mike Reynolds</p>
              <p className="text-sm text-muted-foreground">Reynolds Electric Co.</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex gap-0.5 text-amber-500 mb-4" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground italic mb-6">
                &ldquo;I didn&apos;t realize how many calls were slipping through until this was set up. One booked job in the first week covered the cost. It just works.&rdquo;
              </p>
              <p className="font-semibold">Jason Alvarez</p>
              <p className="text-sm text-muted-foreground">Alvarez Plumbing & Drain</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex gap-0.5 text-amber-500 mb-4" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground italic mb-6">
                &ldquo;Customers don&apos;t leave voicemails anymore — they call the next shop. This keeps us from losing work when the front desk is busy or after hours.&rdquo;
              </p>
              <p className="font-semibold">Tom Bennett</p>
              <p className="text-sm text-muted-foreground">Bennett Automotive Repair</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guarantee + CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Guarantee</h2>
          </div>
          <p className="text-lg mb-6 opacity-90 max-w-xl mx-auto">
            If it doesn&apos;t capture real leads in your first month, cancel. No lock-in.
          </p>
          <h3 className="text-xl font-semibold mb-4">Start Now</h3>
          <p className="mb-8 opacity-90">
            Turn on 24/7 answering and stop losing inbound jobs.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90">
              Activate CallGrabbr
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-6 text-sm opacity-80">
            50 free trial minutes or 4 days. No card required.
          </p>
        </div>
      </section>
    </div>
  )
}
