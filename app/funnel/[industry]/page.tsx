import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FunnelExperience } from "@/components/funnel/FunnelExperience"
import { getAllFunnelSlugs, getFunnelConfig } from "@/lib/funnel/industry-configs"

type PageProps = { params: Promise<{ industry: string }> }

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
    openGraph: {
      title: config.headline,
      description: config.subheadline,
      type: "website",
    },
  }
}

export default async function FunnelIndustryPage({ params }: PageProps) {
  const { industry: slug } = await params
  const config = getFunnelConfig(slug)
  if (!config) notFound()

  return <FunnelExperience config={config} />
}
