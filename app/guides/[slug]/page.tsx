import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DemoUnlock } from "@/components/marketing/DemoUnlock"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  GUIDE_TRIAL_HREF,
  getAllGuideSlugs,
  getGuideBySlug,
} from "@/lib/guides"
import { PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
import { PRICING_TIERS_BY_KEY, formatJobRoiLine } from "@/lib/pricing-catalog"
import { guidePageMetadata } from "@/lib/seo"
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { trialConversionLine, trialNavCtaLabel, trialSummaryShort } from "@/lib/trial-marketing"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return { title: "CallGrabbr Guides" }
  return guidePageMetadata({
    title: guide.title,
    description: guide.description,
    slug: guide.slug,
    keywords: guide.keywords,
  })
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const pagePath = `/guides/${guide.slug}`
  const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
  const growth = PRICING_TIERS_BY_KEY[PLAN_GROWTH]
  const platinum = PRICING_TIERS_BY_KEY[PLAN_PLATINUM]

  return (
    <div className="flex flex-col">
      <JsonLd
        data={[
          webPageJsonLd({
            name: guide.headline,
            description: guide.description,
            path: pagePath,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.headline, path: pagePath },
          ]),
          faqPageJsonLd(guide.faq),
        ]}
      />

      <article>
        <header className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium text-primary mb-3">{guide.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{guide.headline}</h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{guide.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href={GUIDE_TRIAL_HREF}>
                  {trialNavCtaLabel()}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {guide.showDemo && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="#demo">Try a demo call</Link>
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">{trialSummaryShort()}</p>
          </div>
        </header>

        {guide.comparison && (
          <section className="border-y border-border/50 bg-muted/30 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-2xl font-bold mb-6 text-center">
                CallGrabbr vs {guide.comparison.competitorName} at a glance
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left">
                      <th className="p-3 font-semibold text-muted-foreground"> </th>
                      <th className="p-3 font-semibold">CallGrabbr</th>
                      <th className="p-3 font-semibold">{guide.comparison.competitorName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.comparison.rows.map((row) => (
                      <tr key={row.label} className="border-b border-border/40 last:border-0">
                        <td className="p-3 text-muted-foreground font-medium">{row.label}</td>
                        <td className="p-3">{row.callgrabbr}</td>
                        <td className="p-3 text-muted-foreground">{row.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl space-y-12">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="text-muted-foreground leading-relaxed mb-4">
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-2 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {guide.showPricingSnippet && (
            <section className="rounded-xl border border-border/60 bg-muted/20 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-2">CallGrabbr plans</h2>
              <p className="text-sm text-muted-foreground mb-4">{formatJobRoiLine()}</p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex justify-between gap-4 border-b border-border/40 pb-2">
                  <span className="font-medium">{PLAN_BASIC}</span>
                  <span className="text-muted-foreground">${basic.price}/mo · missed &amp; after-hours</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-border/40 pb-2">
                  <span className="font-medium">{PLAN_GROWTH}</span>
                  <span className="text-muted-foreground">${growth.price}/mo · most inbound answered</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="font-medium">{PLAN_PLATINUM}</span>
                  <span className="text-muted-foreground">${platinum.price}/mo · multi-crew volume</span>
                </li>
              </ul>
              <Button asChild>
                <Link href={GUIDE_TRIAL_HREF}>{trialNavCtaLabel()}</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                <Link href="/pricing" className="underline underline-offset-2">
                  Full pricing details
                </Link>
              </p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-6">FAQ</h2>
            <dl className="space-y-6">
              {guide.faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold mb-2">{item.question}</dt>
                  <dd className="text-muted-foreground leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          {guide.relatedLinks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Related</h2>
              <ul className="space-y-2 text-sm">
                {guide.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-primary underline underline-offset-2">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {guide.showDemo && (
          <section id="demo" className="bg-muted/30 border-y border-border/50 py-16">
            <div className="container mx-auto px-4 max-w-xl">
              <h2 className="text-2xl font-bold text-center mb-6">Try a demo call</h2>
              <DemoUnlock />
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to stop losing jobs to missed calls?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{trialConversionLine()}</p>
          <Button size="lg" asChild>
            <Link href={GUIDE_TRIAL_HREF}>{trialNavCtaLabel()}</Link>
          </Button>
        </section>
      </article>
    </div>
  )
}
