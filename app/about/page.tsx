import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { FOUNDER, WHY_I_BUILT_THIS } from "@/lib/marketing/founder"
import { FounderAttestation } from "@/components/marketing/FounderAttestation"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { PRODUCT_FAQ } from "@/lib/faq-data"
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { Button } from "@/components/ui/button"
import { trialNavCtaLabel } from "@/lib/trial-marketing"
import { SEO_HUBS } from "@/lib/seo-hubs"

const { title: TITLE, description: DESCRIPTION } = SEO_HUBS.about

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [...SEO_KEYWORDS, "about CallGrabbr", "CallGrabbr founder"],
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function AboutPage() {
  const paragraphs = WHY_I_BUILT_THIS.split("\n\n")

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd
        data={[
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/about",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          faqPageJsonLd(PRODUCT_FAQ.slice(0, 3)),
        ]}
      />

      <p className="text-sm font-medium text-primary mb-3">About</p>
      <h1 className="text-4xl font-bold tracking-tight mb-8">{SEO_HUBS.about.heading}</h1>

      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
        <Image
          src={FOUNDER.photoSrc}
          alt={`${FOUNDER.name}, founder of CallGrabbr`}
          width={288}
          height={288}
          className="h-36 w-36 rounded-xl object-cover object-top border border-border/60"
          sizes="144px"
          priority
        />
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">{FOUNDER.name}</p>
          <p className="text-sm text-muted-foreground">{FOUNDER.title}</p>
        </div>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <FounderAttestation />
      </div>

      <section className="mb-12" aria-labelledby="about-faq-heading">
        <h2 id="about-faq-heading" className="text-xl font-semibold mb-4">
          Quick answers
        </h2>
        <div className="space-y-2">
          {PRODUCT_FAQ.slice(0, 3).map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-medium">
                {item.question}
              </summary>
              <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <nav
        aria-label="Related pages"
        className="mb-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
      >
        <Link href="/guides" className="hover:text-primary underline-offset-2 hover:underline">
          Guides
        </Link>
        <Link href="/compare" className="hover:text-primary underline-offset-2 hover:underline">
          Compare
        </Link>
        <Link href="/pricing" className="hover:text-primary underline-offset-2 hover:underline">
          Pricing
        </Link>
        <Link href="/for/hvac" className="hover:text-primary underline-offset-2 hover:underline">
          HVAC
        </Link>
      </nav>

      <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Questions? {SUPPORT_EMAIL}
        </p>
        <Button asChild>
          <Link href="/sign-up?next=%2Ftrial%2Fstart">{trialNavCtaLabel()}</Link>
        </Button>
      </div>
    </div>
  )
}
