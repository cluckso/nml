import type { Metadata } from "next"
import Link from "next/link"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_URL } from "@/lib/site-url"

const ENTRIES = [
  {
    date: "2026-09-15",
    title: "Site trust, SEO, and comparison links",
    items: [
      "Public /about page for founder visibility",
      "/llms.txt for AI assistants",
      "Compare-us links to CallGrabbr vs Ruby, Smith AI, Rosie, and OnCrew",
      "Childcare added to the homepage trade grid",
      "30-day money-back guarantee stated on the homepage and in Terms",
    ],
  },
] as const

export const metadata: Metadata = {
  title: "Changelog | CallGrabbr",
  description: "Dated product and website updates for CallGrabbr, the AI answering service for trades.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Changelog | CallGrabbr",
    description: "Dated CallGrabbr updates.",
    type: "article",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "CallGrabbr changelog",
          url: `${SITE_URL}/changelog`,
          blogPost: ENTRIES.map((entry) => ({
            "@type": "BlogPosting",
            headline: entry.title,
            datePublished: entry.date,
            url: `${SITE_URL}/changelog`,
          })),
        }}
      />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Changelog</h1>
      <p className="text-muted-foreground mb-10">
        Dated notes so visitors and crawlers can see what changed.
      </p>
      <ol className="space-y-10 list-none">
        {ENTRIES.map((entry) => (
          <li key={entry.date}>
            <p className="text-sm font-medium text-primary mb-1">
              <time dateTime={entry.date}>{entry.date}</time>
            </p>
            <h2 className="text-xl font-semibold mb-3">{entry.title}</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-12 text-sm">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
