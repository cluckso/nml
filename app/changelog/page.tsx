import type { Metadata } from "next"
import Link from "next/link"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_URL } from "@/lib/site-url"
import { AUTHOR_PATH, GUIDE_AUTHOR_NAME } from "@/lib/guides/authorship"
import { articleJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { FREE_TRIAL_MINUTES, TRIAL_DAYS, OVERAGE_RATE_PER_MIN, ANNUAL_FREE_MONTHS } from "@/lib/plans"
import { PRICING_TIERS } from "@/lib/pricing-catalog"

const TITLE = "CallGrabbr changelog and updates"
const DESCRIPTION =
  "Dated CallGrabbr product notes: plan prices, included minutes, the 14-day trial, and what changed on the public site."

const ENTRIES = [
  {
    date: "2026-10-26",
    title: "SEO keyword map, schema, and linking pass",
    items: [
      "Durable search-intent map in lib/seo-keywords.ts; industry meta titles/descriptions filled in.",
      "FAQ + breadcrumb JSON-LD on pricing, home, about, compare, and industry pages; dashboard/admin/onboarding noindex.",
      "Footer and nav industry links; guide relatedLinks denser; blog ISR + fuller meta; next/image on social-proof avatars.",
    ],
  },
  {
    date: "2026-10-25",
    title: "SEO crawl fixes and discovery",
    items: [
      "Auth pages noindex to match robots.txt; footer “See how it works” points at /for/hvac instead of a noindex funnel.",
      "Sitemap lastmod and guide dateModified bumped for the pricing package; /start added to the sitemap.",
      "Pricing and FAQ titles lead with missed-call lead capture; SoftwareApplication schema uses AggregateOffer for all three plans.",
      "llms.txt lists guides hub, blog, and buyer guides; Compare added to nav; related guides on childcare, cleaning, and landscaping pages.",
    ],
  },
  {
    date: "2026-10-25",
    title: "Pricing package for margin and adoption",
    items: [
      "Basic stays $99 with 250 included minutes (was 300); default “best to start” plan.",
      "Growth is $189 with 500 included minutes (was $159 / 800) — sold for appointments and CRM, not raw minutes.",
      "Platinum stays $279 with 1,200 included minutes (was 1,500).",
      "Overage is $0.29/min (was $0.22). Stripe live prices updated; vs-Rosie / OnCrew / Ruby / Smith / Broccoli tables refreshed.",
    ],
  },
  {
    date: "2026-09-30",
    title: "Guide dates, author, and sitemap lastmod",
    items: [
      "Contractor guides now name Steven Steinhoff, show published and updated dates, and link an author page.",
      "The category guide cites the BLS HVAC outlook and the Twilio Lookup API.",
      "Sitemap lastmod uses those edit dates instead of the build clock.",
      "Homepage and pricing images set width and height.",
    ],
  },
  {
    date: "2026-09-15",
    title: "Site trust, SEO, and comparison links",
    items: [
      "Public /about page for the founding note.",
      "/llms.txt for AI assistants.",
      "Compare links to CallGrabbr vs Ruby, Smith AI, Rosie, and OnCrew.",
      "Childcare on the homepage trade grid.",
      "30-day money-back guarantee on the homepage and in Terms.",
    ],
  },
] as const

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function ChangelogPage() {
  const plans = PRICING_TIERS.map(
    (tier) =>
      `${tier.name} is $${tier.price} per month with ${tier.includedMinutes.toLocaleString()} minutes included. ${tier.usageNote}`
  )

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd
        data={[
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/changelog",
          }),
          articleJsonLd({
            headline: ENTRIES[0].title,
            description: DESCRIPTION,
            path: "/changelog",
            datePublished: ENTRIES[1].date,
            dateModified: ENTRIES[0].date,
          }),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "CallGrabbr changelog",
            url: `${SITE_URL}/changelog`,
            blogPost: ENTRIES.map((entry) => ({
              "@type": "BlogPosting",
              headline: entry.title,
              datePublished: entry.date,
              dateModified: entry.date,
              author: {
                "@type": "Person",
                name: GUIDE_AUTHOR_NAME,
                url: `${SITE_URL}${AUTHOR_PATH}`,
              },
              url: `${SITE_URL}/changelog`,
            })),
          },
        ]}
      />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Changelog</h1>
      <p className="text-muted-foreground mb-10 leading-relaxed">
        Dated notes so you can see what changed. Prices below are the live catalog, not a historical quote.
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

      <h2 className="text-2xl font-bold mt-14 mb-4">What those notes mean in numbers</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          CallGrabbr is missed-call lead capture for local trades. You keep your business number and
          forward calls. When you cannot pick up, the line collects the caller&apos;s name, phone, job,
          address, urgency, and a preferred time, then texts and emails you. A recording is optional.
        </p>
        {plans.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          Calls past the included minutes are ${OVERAGE_RATE_PER_MIN.toFixed(2)} per minute. Each call
          bills at least one minute, and partial minutes round up. Paying annually bills{" "}
          {12 - ANNUAL_FREE_MONTHS} months of a 12-month term ({ANNUAL_FREE_MONTHS} months are not
          charged). There is no setup fee.
        </p>
        <p>
          The trial is {TRIAL_DAYS} days or {FREE_TRIAL_MINUTES} real call minutes, whichever comes
          first. No card to start. One trial per business number. Paid plans include a 30-day
          money-back guarantee. Canceling stops the next bill.
        </p>
        <p>
          Basic includes trade-tuned intake and text-back confirmation to callers on captured leads.
          Growth adds more included minutes, appointments, emergency handling, follow-up texts, and
          CRM email or a webhook into ServiceTitan, Housecall Pro, Jobber, or Zapier. Platinum adds
          a branded voice, multi-department routing, after-hours emergency routing, weekly reports,
          and priority support.
        </p>
        <p>
          Dedicated intake questions exist for HVAC, plumbing, electrical, auto repair, handyman, and
          childcare on Basic and above. Cleaning and landscaping use the generic script. Spam and
          robocalls are filtered so alerts focus on real leads.
        </p>
        <p>
          Three missed calls on a busy day, an 80% hang-up rate, and a job at $300–$600: one job in
          that range covers more than a month of Basic at $99.
        </p>
        <p>
          Setup is call forwarding on the number customers already dial. Your phone can ring first.
          You set how long it rings before CallGrabbr picks up, or you can send every call straight
          through. Carrier steps for AT&amp;T, Verizon, and T-Mobile are on the help page. The
          shop does not get a new public number unless you want one.
        </p>
        <p>
          A captured lead can include the caller&apos;s name, callback number, service address, what
          is broken, how urgent it is, a preferred time, a short summary, and an optional recording.
          Every paid plan can text the caller a confirmation after capture so they do not dial the
          next shop while you are still on the job. Growth and Platinum add CRM webhook delivery and
          optional follow-up texts. The webhook posts that same summary to whatever URL you
          save. There is no CallGrabbr app inside the Zapier directory yet. You connect it with
          Zapier&apos;s webhook trigger.
        </p>
        <p>
          Voicemail is free and keeps about 5–15 percent of callers. A human answering service starts
          at $235 a month and often adds a fee for nights. Basic at $99 is a fraction of that cost.
          Growth at $189 and Platinum at $279 add appointments, CRM, and more minutes as volume grows.
        </p>
        <p>
          The September 15 note added the about page, the llms.txt file, four comparison guides, the
          childcare card, and the money-back line in Terms. The September 30 note did not change plan
          prices. It put a name, dates, and two outside sources on the guides, and it stopped the
          sitemap from stamping every URL with the build time.
        </p>
        <p>
          Written by{" "}
          <Link href={AUTHOR_PATH} className="text-primary underline underline-offset-2">
            {GUIDE_AUTHOR_NAME}
          </Link>
          . Prices on this page are checked against the pricing catalog before publish.
        </p>
      </div>
      <p className="mt-12 text-sm">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
