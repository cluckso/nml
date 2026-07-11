import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/seo/JsonLd"
import { GUIDE_TRIAL_HREF, getAllGuides } from "@/lib/guides"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { trialNavCtaLabel, trialSummaryShort } from "@/lib/trial-marketing"

export const metadata: Metadata = {
  title: "Guides for Contractors | CallGrabbr",
  description:
    "Comparisons and buyer guides for HVAC and plumbing shops: vs Ruby, Smith.ai, Rosie, OnCrew, AI vs live, and after-hours cost.",
  keywords: [...SEO_KEYWORDS, "CallGrabbr guides", "contractor answering service comparison"],
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Guides for Contractors | CallGrabbr",
    description:
      "Contractor guides: AI vs live, plumbing and HVAC buyers, and comparisons vs Ruby, Smith.ai, Rosie, and OnCrew.",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides for Contractors | CallGrabbr",
    description: "Eight contractor guides: comparisons, buyer guides, and after-hours cost.",
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function GuidesIndexPage() {
  const guides = getAllGuides()

  return (
    <div className="flex flex-col">
      <JsonLd
        data={[
          webPageJsonLd({
            name: "CallGrabbr Guides",
            description:
              "Comparisons and buyer guides for HVAC and plumbing contractors choosing an answering service.",
            path: "/guides",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Guides for contractors</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Straight comparisons and cost guides for shops that can&apos;t afford missed after-hours jobs.
          </p>
          <Button size="lg" asChild>
            <Link href={GUIDE_TRIAL_HREF}>
              {trialNavCtaLabel()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">{trialSummaryShort()}</p>
        </div>

        <ul className="max-w-3xl mx-auto space-y-4">
          {guides.map((guide) => (
            <li key={guide.slug} className="border border-border/60 rounded-lg p-5 md:p-6">
              <p className="text-xs font-medium text-primary mb-1">{guide.eyebrow}</p>
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/guides/${guide.slug}`} className="hover:underline underline-offset-2">
                  {guide.headline}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{guide.description}</p>
              <Link
                href={`/guides/${guide.slug}`}
                className="text-sm font-medium text-primary inline-flex items-center gap-1"
              >
                Read guide
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
