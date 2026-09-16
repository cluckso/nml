import type { Metadata } from "next"
import Link from "next/link"
import { User } from "lucide-react"
import { FOUNDER, WHY_I_BUILT_THIS, founderByline } from "@/lib/marketing/founder"
import { DEFAULT_OG_IMAGE, SEO_KEYWORDS } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { Button } from "@/components/ui/button"
import { trialNavCtaLabel } from "@/lib/trial-marketing"

const TITLE = "About CallGrabbr — Why I built this"
const DESCRIPTION =
  "Why CallGrabbr exists: an AI answering service that captures missed-call leads for HVAC, plumbing, and other local trades."

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
  const byline = founderByline()
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
        ]}
      />

      <p className="text-sm font-medium text-primary mb-3">About</p>
      <h1 className="text-4xl font-bold tracking-tight mb-8">Why I built this</h1>

      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
        {FOUNDER.photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={FOUNDER.photoSrc}
            alt={FOUNDER.name ? `${FOUNDER.name}` : "Founder"}
            className="h-36 w-36 rounded-xl object-cover border border-border/60"
          />
        ) : (
          <div
            className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/40 text-muted-foreground"
            role="img"
            aria-label="Founder photo placeholder"
          >
            <User className="h-10 w-10 mb-2" aria-hidden />
            <span className="text-xs text-center px-2">Founder photo goes here</span>
          </div>
        )}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">
            {FOUNDER.name ?? "Founder name goes here"}
          </p>
          {byline ? <p>{byline}</p> : <p>Add name, trade background, and LinkedIn — do not invent them.</p>}
          {FOUNDER.linkedInUrl ? (
            <p>
              <a
                href={FOUNDER.linkedInUrl}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </p>
          ) : (
            <p>LinkedIn link goes here.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

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
