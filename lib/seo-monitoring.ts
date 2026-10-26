/**
 * SEO tracking + monitoring sources of truth (KAN-13).
 * Ops checklist lives in docs/SEO_MONITORING.md.
 */

import { SITE_URL } from "@/lib/site-url"

/** Google Search Console HTML-tag verification (also set via GOOGLE_SITE_VERIFICATION env). */
export const GOOGLE_SITE_VERIFICATION_FALLBACK =
  "vbp7kMaN9FYqtyLddH0hqILwUGQLAq6l8XbER6JwCJ0"

/** GA4 measurement ID used site-wide. */
export const GA4_MEASUREMENT_ID = "G-F7EPPRSNR1"

/** Canonical property URL for Search Console (www). */
export const SEARCH_CONSOLE_PROPERTY = SITE_URL

/** Sitemap URL to submit / monitor in Search Console. */
export const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

/** Robots URL to spot-check after deploys. */
export const ROBOTS_URL = `${SITE_URL}/robots.txt`

/** Paths that must never appear in the public sitemap. */
export const SITEMAP_BLOCKLIST_PREFIXES = [
  "/api/",
  "/admin/",
  "/dashboard/",
  "/settings/",
  "/calls/",
  "/appointments/",
  "/billing/",
  "/agency/",
  "/onboarding/",
  "/subscribe/",
  "/funnel/",
  "/sign-in",
  "/sign-up",
] as const

/** Core marketing URLs that must stay in the sitemap. */
export const SITEMAP_MUST_INCLUDE = [
  "",
  "/pricing",
  "/compare",
  "/guides",
  "/docs/faq",
  "/for/hvac",
  "/for/plumbing",
  "/start",
  "/llms.txt",
] as const

export function googleSiteVerificationToken(): string {
  return process.env.GOOGLE_SITE_VERIFICATION?.trim() || GOOGLE_SITE_VERIFICATION_FALLBACK
}
