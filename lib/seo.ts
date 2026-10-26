import type { Metadata } from "next"
import {
  industryIntentKeywords,
  keywordsForPath,
  SHARED_SEO_KEYWORDS,
} from "@/lib/seo-keywords"
import { SITE_URL } from "@/lib/site-url"
import { siteMetaDescription } from "@/lib/trial-marketing"

/** @deprecated Prefer SHARED_SEO_KEYWORDS / keywordsForPath from seo-keywords.ts */
export const SEO_KEYWORDS = SHARED_SEO_KEYWORDS

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
    keywords: keywordsForPath("/"),
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: SITE_URL,
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
  metaTitle?: string
  metaDescription?: string
}): Metadata {
  const title = input.metaTitle ?? `${input.headline} | CallGrabbr`
  const description = input.metaDescription ?? input.subheadline
  const keywords = industryIntentKeywords(input.industryName)

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

export function guideDocumentTitle(title: string): string {
  return title.includes("CallGrabbr") ? title : `${title} | CallGrabbr`
}

export function guidePageMetadata(input: {
  title: string
  description: string
  slug: string
  keywords?: string[]
}): Metadata {
  const title = guideDocumentTitle(input.title)
  const description = input.description
  const keywords = [...keywordsForPath("/guides"), ...(input.keywords ?? [])]

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
