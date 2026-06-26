import type { MetadataRoute } from "next"

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com").replace(/\/$/, "")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/", "/settings/", "/calls/", "/appointments/", "/billing/", "/agency/", "/onboarding/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
