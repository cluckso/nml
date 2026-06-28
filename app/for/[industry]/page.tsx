import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MID_AND_HIGH_VOLUME_LABEL, PLAN_MID_VOLUME, PLAN_HIGH_VOLUME } from "@/lib/plan-labels"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Phone, ArrowRight } from "lucide-react"
import { getAllIndustrySlugs, getIndustryLandingBySlug, formatCurrency } from "@/lib/industry-data"
import { DemoUnlock } from "@/components/marketing/DemoUnlock"
import { SMSPreview } from "@/components/marketing/SMSPreview"

type PageProps = { params: Promise<{ industry: string }> }

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((industry) => ({ industry }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { industry: slug } = await params
  const data = getIndustryLandingBySlug(slug)
  if (!data) return { title: "CallGrabbr" }
  return {
    title: `${data.headline} | CallGrabbr`,
    description: data.subheadline,
    alternates: { canonical: `/for/${slug}` },
    openGraph: {
      title: data.headline,
      description: data.subheadline,
      type: "website",
    },
  }
}

export default async function IndustryLandingPage({ params }: PageProps) {
  const { industry: slug } = await params
  const data = getIndustryLandingBySlug(slug)
  if (!data) notFound()

  return (
    <div className="flex flex-col">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-medium text-primary mb-3">Built for {data.name}</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{data.headline}</h1>
          <p className="text-lg text-muted-foreground mb-8">{data.subheadline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/trial/start">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Average {data.name.toLowerCase()} job: {formatCurrency(data.averageJobValue)} · One captured lead can pay for months of service
          </p>
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border/50 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground font-medium">{data.statMissedCalls}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">
          <div>
            <h2 className="text-2xl font-bold mb-4">Why {data.name} businesses choose CallGrabbr</h2>
            <ul className="space-y-3">
              {data.painPoints.map((point) => (
                <li key={point} className="flex gap-2 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                What callers hear
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {data.exampleQuestions.map((q) => (
                <p key={q}>&ldquo;{q}&rdquo;</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
          <SMSPreview />
          <div>
            <h2 className="text-2xl font-bold mb-4">What happens after a completed call?</h2>
            <p className="text-muted-foreground mb-6">
              You get captured lead info in a neat, easy-to-read text or email—or sent directly to your CRM on {MID_AND_HIGH_VOLUME_LABEL}.
            </p>
            <h3 className="text-lg font-semibold mb-4">Your call assistant collects as much pertinent lead information as possible, including:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-none">
              {[
                "Caller name + phone number",
                "Service requested",
                "Problem description",
                "Address / location",
                "Urgency level",
                "Preferred appointment time",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              {["24/7 call answering (when forwarded)", `Industry-specific intake on ${PLAN_MID_VOLUME} & ${PLAN_HIGH_VOLUME}`, `Emergency flagging on ${PLAN_MID_VOLUME} & ${PLAN_HIGH_VOLUME}`, "No setup fee · 7-day trial"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border/50 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="text-2xl font-bold text-center mb-6">Try a demo call</h2>
          <DemoUnlock />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to stop losing {data.name.toLowerCase()} jobs?</h2>
        <Button size="lg" asChild>
          <Link href="/sign-up">Get started free</Link>
        </Button>
      </section>
    </div>
  )
}
