import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CreditCard, Clock, Globe, UserPlus, PhoneForwarded, LayoutDashboard } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section — dark blue/purple gradient overlay */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(217_91%_60%_/_.15),transparent)]" />
        <div className="container relative z-10 mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Globe className="h-4 w-4" />
            Now supporting multi-language intake
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Never Miss Another Call{" "}
            <span className="text-gradient-hero">Even After Hours</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            AI-powered answering & intake built for local service businesses.
            Capture leads, book requests, and emergencies — without hiring staff.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Free Trial — 50 Minutes, 14 Days
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
              Card required to start — no charge until you upgrade
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What It Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Answers Every Call</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Never miss a lead, even when you're busy or closed. Works 24/7.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Captures Caller Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically collects name, phone, address, and issue details.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Filters Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Instantly flags urgent calls so you can prioritize what matters.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Sends Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant email notifications with all call details.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Works 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Never calls in sick. Always available to answer your customers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Feels Like a Receptionist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional, friendly AI that represents your business well.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Three simple steps to start capturing every call.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
                <UserPlus className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Sign up</h3>
              <p className="text-muted-foreground text-sm">
                Create your account and start a free trial. Add your business phone and payment method — we don&apos;t charge until you upgrade.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
                <PhoneForwarded className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Forward your line</h3>
              <p className="text-muted-foreground text-sm">
                Follow our simple guide to route calls to your AI agent instead of voicemail. A few taps or a quick dial code — takes about 5 minutes.
              </p>
              <Link href="/docs/faq" className="mt-2 text-sm font-medium text-primary hover:underline">
                See setup guide →
              </Link>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Get your reports</h3>
              <p className="text-muted-foreground text-sm">
                View every call in your dashboard — transcripts, summaries, and lead details. Get instant email notifications for each call. Weekly report emails on higher plans.
              </p>
              <p className="mt-2 text-xs text-muted-foreground italic">
                Reports by text coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-muted/50 py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Who It&apos;s For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <h3 className="font-semibold mb-2">Plumbers & HVAC</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Auto Repair</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Childcare</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Electricians</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lawn & Snow</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Small Medical</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Wellness Offices</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Service Businesses</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why This Pays for Itself</h2>
          <p className="text-lg text-muted-foreground mb-8">
            If you recover just one missed service call per month, the system covers its cost.
            Most customers recover 3–10 calls they were missing before.
          </p>
          <div className="bg-muted/50 border border-border/50 p-8 rounded-xl">
            <p className="text-2xl font-semibold mb-4">
              A human receptionist = $2,000–$3,500/month
            </p>
            <p className="text-2xl font-semibold text-primary">
              Your AI = $99–$349/month
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Capturing Every Call</h2>
          <p className="text-lg mb-8 opacity-90">
            50 free trial minutes, 14 days. Card required to start — no charge until you upgrade. 5-minute setup.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90">
              Start Free Trial — 50 Minutes, 14 Days
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
