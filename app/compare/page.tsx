import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonLd } from "@/components/seo/JsonLd"
import { CATEGORY_NAME, FOOTER_TAGLINE, HERO_H1 } from "@/lib/marketing/positioning"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { GUIDE_TRIAL_HREF } from "@/lib/guides"
import { trialNavCtaLabel, trialSummaryShort } from "@/lib/trial-marketing"
import { CATEGORY_COMPARE_LINK, VS_PAGE_LINKS } from "@/lib/marketing/comparisons"

const COMPARISONS = [...VS_PAGE_LINKS, CATEGORY_COMPARE_LINK]

export const metadata: Metadata = {
  title: "Compare CallGrabbr vs AI Answering & Receptionists",
  description: `${FOOTER_TAGLINE} See how CallGrabbr compares to Ruby, Rosie, Smith.ai, OnCrew, and generic AI answering for contractors.`,
  keywords: [
    ...SEO_KEYWORDS,
    "CallGrabbr comparison",
    "missed call lead capture",
    "AI answering service alternative",
    "contractor answering comparison",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare CallGrabbr vs AI Answering & Receptionists",
    description: FOOTER_TAGLINE,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare CallGrabbr vs AI Answering & Receptionists",
    description: FOOTER_TAGLINE,
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
            description: `How CallGrabbr ${CATEGORY_NAME} compares to AI answering services and live receptionists.`,
            path: "/compare",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
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

        <p className="max-w-3xl mx-auto mt-10 text-center text-sm text-muted-foreground">
          More buyer guides on{" "}
          <Link href="/guides" className="text-primary font-medium hover:underline">
            all contractor guides
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
