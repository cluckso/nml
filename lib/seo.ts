import type { Metadata } from "next"
import { siteMetaDescription } from "@/lib/trial-marketing"

/** Shared SEO keywords — lead with missed-call lead capture; legacy answering terms secondary. */
export const SEO_KEYWORDS = [
  "missed call lead capture",
  "after hours lead capture HVAC",
  "voicemail alternative for contractors",
  "stop losing jobs to missed calls",
  "contractor lead capture from missed calls",
  "lead capture phone system",
  "missed call solution",
  "HVAC answering service",
  "plumber answering service",
  "local service business",
  "CallGrabbr",
] as const

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "CallGrabbr — Stop losing jobs to missed calls",
} as const

export function homePageMetadata(): Metadata {
  const title = "CallGrabbr - Stop Losing Jobs to Missed Calls"
  const description = siteMetaDescription()

  return {
    title,
    description,
    keywords: [...SEO_KEYWORDS],
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export function industryPageMetadata(input: {
  headline: string
  subheadline: string
  slug: string
  industryName: string
}): Metadata {
  const title = `${input.headline} | CallGrabbr`
  const description = input.subheadline
  const keywords = [
    ...SEO_KEYWORDS,
    `${input.industryName} missed call lead capture`,
    `${input.industryName} after hours lead capture`,
    `${input.industryName} missed calls`,
    `${input.industryName} answering service`,
  ]

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/for/${input.slug}` },
    openGraph: {
      title: input.headline,
      description,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: input.headline,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export function guidePageMetadata(input: {
  title: string
  description: string
  slug: string
  keywords?: string[]
}): Metadata {
  const title = input.title.includes("CallGrabbr") ? input.title : `${input.title} | CallGrabbr`
  const description = input.description
  const keywords = [...SEO_KEYWORDS, ...(input.keywords ?? [])]

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/guides/${input.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
