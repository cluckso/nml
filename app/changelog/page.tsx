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
          first. No card to start. One trial per business number. The 30-day money-back guarantee
          covers the first paid subscription. Overage for minutes already used may not be refunded.
          Canceling stops the next bill. It does not refund a month you already paid.
        </p>
        <p>
          Basic is overflow: missed calls, nights, and weekends. It is not a full-day front desk.
          Growth adds 24/7 capture, trade-specific intake, appointments, emergency handling, a text
          back to the caller, and CRM email or a webhook into ServiceTitan, Housecall Pro, Jobber, or
          Zapier. Platinum adds a branded voice, multi-department routing, after-hours emergency
          routing, weekly reports, and priority support.
        </p>
        <p>
          Dedicated intake questions exist for HVAC, plumbing, electrical, auto repair, handyman, and
          childcare, on Growth and Platinum. Cleaning and landscaping use the generic script. Spam
          filtering uses a phone lookup and fails open: if the lookup errors, the call is not dropped.
          If a caller asks, the assistant says it is automated.
        </p>
        <p>
          Example, not a measured CallGrabbr result: three missed calls on a busy day, an industry
          hang-up share around 80 percent, and a job you price at $300, $500, or $600. One job in that
          range covers more than a month of Basic at $99. Your ticket and your miss rate will differ.
          The 80–95 percent line on the homepage is an industry rate for answered calls. It is not a
          count of CallGrabbr shops.
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
          Growth and Platinum can text the caller a confirmation so they do not dial the next shop
          while you are still on the job. The webhook posts that same summary to whatever URL you
          save. There is no CallGrabbr app inside the Zapier directory yet. You connect it with
          Zapier&apos;s webhook trigger.
        </p>
        <p>
          Voicemail is free and, on industry figures, keeps about 5–15 percent of callers. A human
          answering service on the pricing table starts at $235 a month and often adds a fee for
          nights. CallGrabbr&apos;s answered-call comparison uses the same 80–95 percent industry
          band as that human column. It is not a first-party capture rate. Basic at $99 is about 42
          percent of that $235 entry price, not &quot;less than 40 percent&quot; of every plan.
          Growth at $159 is higher than that ratio. Platinum at $279 is above the $235 line and is
          priced for multi-crew volume, not as a discount on a receptionist seat.
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
