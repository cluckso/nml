import type { MetadataRoute } from "next"
import { getAllIndustrySlugs } from "@/lib/industry-data"
import { getAllGuideSlugs } from "@/lib/guides"

import { SITE_URL } from "@/lib/site-url"

const siteUrl = SITE_URL

/** Public marketing routes only — auth, funnel, and app routes are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/pricing",
    "/docs/faq",
    "/privacy",
    "/terms",
    "/sms-terms",
    "/trial/start",
    "/integrations/zapier",
    "/guides",
  ]

  const industryRoutes = getAllIndustrySlugs().map((industry) => `/for/${industry}`)
  const guideRoutes = getAllGuideSlugs().map((slug) => `/guides/${slug}`)

  return [...staticRoutes, ...industryRoutes, ...guideRoutes].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency:
      path === ""
        ? "weekly"
        : path.startsWith("/for/") || path.startsWith("/guides")
          ? "monthly"
          : "monthly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/guides/")
          ? 0.8
          : path === "/guides"
            ? 0.75
            : path.startsWith("/for/")
              ? 0.85
              : path === "/pricing"
                ? 0.9
                : 0.6,
  }))
}
