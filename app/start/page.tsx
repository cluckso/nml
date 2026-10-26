import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { MetaStartPicker } from "@/components/funnel/MetaStartPicker"
import { CATEGORY_NAME } from "@/lib/marketing/positioning"
import {
  buildMetaStartRedirectUrl,
  getMetaIndustryFromParams,
  parseMetaLeadPrefill,
} from "@/lib/meta-lead-routing"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

const START_TITLE = "Get Started with CallGrabbr — choose your trade now"
const START_DESCRIPTION = `Choose your trade to see your missed-call estimate — ${CATEGORY_NAME} that texts you the lead in seconds. HVAC, plumbing, electrical, auto, and handyman shops start free.`

export const metadata: Metadata = {
  title: START_TITLE,
  description: START_DESCRIPTION,
  alternates: { canonical: "/start" },
  robots: { index: true, follow: true },
  openGraph: {
    title: START_TITLE,
    description: START_DESCRIPTION,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: START_TITLE,
    description: START_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MetaStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const slug = getMetaIndustryFromParams(params)

  if (slug) {
    const prefill = parseMetaLeadPrefill(params)
    redirect(buildMetaStartRedirectUrl(slug, params, prefill))
  }

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <MetaStartPicker />
    </Suspense>
  )
}
