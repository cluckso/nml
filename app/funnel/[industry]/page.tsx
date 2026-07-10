import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FunnelExperience } from "@/components/funnel/FunnelExperience"
import { getAllFunnelSlugs, getFunnelConfig } from "@/lib/funnel/industry-configs"
import { parseMetaLeadPrefill } from "@/lib/meta-lead-routing"

type PageProps = {
  params: Promise<{ industry: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  return getAllFunnelSlugs().map((industry) => ({ industry }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { industry: slug } = await params
  const config = getFunnelConfig(slug)
  if (!config) return { title: "CallGrabbr" }

  return {
    title: `${config.headline} | CallGrabbr Funnel`,
    description: config.subheadline,
    alternates: { canonical: `/funnel/${slug}` },
    robots: { index: false, follow: true },
    openGraph: {
      title: config.headline,
      description: config.subheadline,
      type: "website",
    },
  }
}

export default async function FunnelIndustryPage({ params, searchParams }: PageProps) {
  const { industry: slug } = await params
  const query = await searchParams
  const config = getFunnelConfig(slug)
  if (!config) notFound()

  const fromMeta = query.from === "meta"
  const metaPrefill = fromMeta ? parseMetaLeadPrefill(query) : null

  return <FunnelExperience config={config} metaPrefill={metaPrefill} />
}
