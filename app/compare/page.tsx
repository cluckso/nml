import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonLd } from "@/components/seo/JsonLd"
import { CATEGORY_NAME, FOOTER_TAGLINE, HERO_H1 } from "@/lib/marketing/positioning"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { PRODUCT_FAQ } from "@/lib/faq-data"
import { keywordsForPath } from "@/lib/seo-keywords"
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { GUIDE_TRIAL_HREF } from "@/lib/guides"
import { trialNavCtaLabel, trialSummaryShort } from "@/lib/trial-marketing"
import { CATEGORY_COMPARE_LINK, VS_PAGE_LINKS } from "@/lib/marketing/comparisons"

const COMPARISONS = [...VS_PAGE_LINKS, CATEGORY_COMPARE_LINK]

const COMPARE_TITLE = "Compare CallGrabbr vs AI Answering & Receptionists"
const COMPARE_DESCRIPTION =
  "Side-by-side missed-call lead capture vs Ruby, Rosie, Smith.ai, OnCrew, Broccoli, and live receptionists for HVAC and plumbing shops."

export const metadata: Metadata = {
  title: COMPARE_TITLE,
  description: COMPARE_DESCRIPTION,
  keywords: keywordsForPath("/compare"),
  alternates: { canonical: "/compare" },
  openGraph: {
    title: COMPARE_TITLE,
    description: COMPARE_DESCRIPTION,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: COMPARE_TITLE,
    description: COMPARE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function ComparePage() {
  return (
    <div className="flex flex-col">
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Compare CallGrabbr",
            description: COMPARE_DESCRIPTION,
            path: "/compare",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
          faqPageJsonLd(
            PRODUCT_FAQ.filter((item) => /What is CallGrabbr|worth|plan should/i.test(item.question))
          ),
        ]}
      />

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Compare CallGrabbr
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {HERO_H1}. We are {CATEGORY_NAME} — not a generic AI receptionist. Use these guides to
            see how we stack up against live answering, hybrid receptionists, and other AI tools.
          </p>
          <p className="text-sm text-muted-foreground mb-8">{FOOTER_TAGLINE}</p>
          <Button size="lg" asChild>
            <Link href={GUIDE_TRIAL_HREF}>
              {trialNavCtaLabel()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">{trialSummaryShort()}</p>
        </div>

        <ul className="max-w-3xl mx-auto grid gap-4 md:grid-cols-1">
          {COMPARISONS.map((item) => (
            <li key={item.href}>
              <Card className="border-border/60 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <p className="text-xs font-medium text-primary mb-1">{item.eyebrow}</p>
                  <CardTitle className="text-xl">
                    <Link href={item.href} className="hover:underline underline-offset-2">
                      {item.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-primary inline-flex items-center gap-1"
                  >
                    Read comparison
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <nav
          aria-label="Related pages"
          className="max-w-3xl mx-auto mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          <Link href="/for/hvac" className="hover:text-primary underline-offset-2 hover:underline">
            HVAC
          </Link>
          <Link href="/for/plumbing" className="hover:text-primary underline-offset-2 hover:underline">
            Plumbing
          </Link>
          <Link href="/pricing" className="hover:text-primary underline-offset-2 hover:underline">
            Pricing
          </Link>
          <Link href="/guides" className="hover:text-primary underline-offset-2 hover:underline">
            All guides
          </Link>
        </nav>
      </section>
    </div>
  )
}
