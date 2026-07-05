import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-url"

const siteUrl = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/", "/settings/", "/calls/", "/appointments/", "/billing/", "/agency/", "/onboarding/", "/funnel/", "/sign-in", "/sign-up"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
