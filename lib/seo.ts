import type { Metadata } from "next"
import { siteMetaDescription } from "@/lib/trial-marketing"

/** Shared SEO keywords for local service / trades marketing pages. */
export const SEO_KEYWORDS = [
  "AI answering service",
  "missed call solution",
  "call forwarding",
  "HVAC answering service",
  "plumber answering service",
  "local service business",
  "after hours call answering",
  "voicemail alternative",
  "lead capture phone system",
  "CallGrabbr",
] as const

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "CallGrabbr — Stop losing jobs to voicemail",
} as const

export function homePageMetadata(): Metadata {
  const title = "CallGrabbr - Stop Losing Jobs to Voicemail"
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
    `${input.industryName} answering service`,
    `${input.industryName} missed calls`,
    `${input.industryName} call forwarding`,
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
