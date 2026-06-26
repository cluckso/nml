import type { MetadataRoute } from "next"
import { getAllIndustrySlugs } from "@/lib/industry-data"

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com").replace(/\/$/, "")

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
    "/sign-in",
    "/sign-up",
  ]

  const industryRoutes = getAllIndustrySlugs().map((industry) => `/for/${industry}`)

  return [...staticRoutes, ...industryRoutes].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/for/") ? 0.8 : 0.6,
  }))
}
