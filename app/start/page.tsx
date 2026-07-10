import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { MetaStartPicker } from "@/components/funnel/MetaStartPicker"
import {
  buildMetaStartRedirectUrl,
  getMetaIndustryFromParams,
  parseMetaLeadPrefill,
} from "@/lib/meta-lead-routing"

export const metadata: Metadata = {
  title: "Get Started | CallGrabbr",
  description: "Choose your industry to see how much missed calls are costing your business.",
  robots: { index: false, follow: true },
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
