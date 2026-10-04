import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { JsonLd } from "@/components/seo/JsonLd"
import { getAllGuides } from "@/lib/guides"
import {
  AUTHOR_PATH,
  EDITORIAL_DISCLOSURE,
  GUIDE_AUTHOR_NAME,
} from "@/lib/guides/authorship"
import { FOUNDER, WHY_I_BUILT_THIS } from "@/lib/marketing/founder"
import { breadcrumbJsonLd, personAuthorJsonLd, webPageJsonLd } from "@/lib/structured-data"

const TITLE = "Steven Steinhoff — CallGrabbr guides"
const DESCRIPTION =
  "Steven Steinhoff writes the CallGrabbr contractor guides. Service-business background, the founding note, and every piece on this site."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: AUTHOR_PATH },
}

export default function AuthorPage() {
  const guides = getAllGuides()
  const paragraphs = WHY_I_BUILT_THIS.split("\n\n")

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd
        data={[
          personAuthorJsonLd(),
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: AUTHOR_PATH,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: GUIDE_AUTHOR_NAME, path: AUTHOR_PATH },
          ]),
        ]}
      />
      <p className="text-sm font-medium text-primary mb-3">Author</p>
      <h1 className="text-4xl font-bold tracking-tight mb-8">{GUIDE_AUTHOR_NAME}</h1>
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
        <Image
          src={FOUNDER.photoSrc}
          alt={`${FOUNDER.name}, author of the CallGrabbr guides`}
          width={288}
          height={288}
          className="h-36 w-36 rounded-xl object-cover object-top border border-border/60"
          priority
        />
        <div className="space-y-2">
          <p className="text-lg font-semibold">{FOUNDER.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{EDITORIAL_DISCLOSURE}</p>
        </div>
      </div>
      <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4">Guides</h2>
      <ul className="space-y-2 text-sm mb-10">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="text-primary underline underline-offset-2">
              {guide.headline}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <Link href="/about" className="text-primary hover:underline">
          Why I built CallGrabbr
        </Link>
      </p>
    </div>
  )
}
