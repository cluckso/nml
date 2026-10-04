import type { MetadataRoute } from "next"
import { getAllGuideSlugs } from "@/lib/guides"
import { AUTHOR_PATH, GUIDE_UPDATED } from "@/lib/guides/authorship"
import { getAllIndustrySlugs } from "@/lib/industry-data"
import { SITE_URL } from "@/lib/site-url"

/** Content edit dates. Not the build clock. */
const EDITED_ON = "2026-09-30"
const SHIPPED_ON = "2026-09-15"
const LEGAL_ON = "2026-09-19"

const STATIC_DATES: Record<string, string> = {
  "": SHIPPED_ON,
  "/pricing": EDITED_ON,
  "/about": SHIPPED_ON,
  "/compare": SHIPPED_ON,
  "/changelog": EDITED_ON,
  "/docs/faq": EDITED_ON,
  "/privacy": LEGAL_ON,
  "/terms": LEGAL_ON,
  "/sms-terms": EDITED_ON,
  "/trial/start": EDITED_ON,
  "/integrations/zapier": EDITED_ON,
  "/guides": EDITED_ON,
  "/llms.txt": SHIPPED_ON,
  [AUTHOR_PATH]: GUIDE_UPDATED,
  "/for/landscaping": EDITED_ON,
  "/for/plumbing": EDITED_ON,
}

function lastModifiedFor(path: string): Date {
  const iso =
    STATIC_DATES[path] ??
    (path.startsWith("/guides/") ? GUIDE_UPDATED : SHIPPED_ON)
  return new Date(`${iso}T12:00:00.000Z`)
}

export function getPublicPaths(): string[] {
  const staticRoutes = Object.keys(STATIC_DATES).filter(
    (path) => path !== "/for/landscaping" && path !== "/for/plumbing"
  )
  const industryRoutes = getAllIndustrySlugs().map((industry) => `/for/${industry}`)
  const guideRoutes = getAllGuideSlugs().map((slug) => `/guides/${slug}`)
  return [...staticRoutes, ...industryRoutes, ...guideRoutes]
}

export function getPublicSitemap(): MetadataRoute.Sitemap {
  return getPublicPaths().map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModifiedFor(path),
    changeFrequency: path === "" ? "weekly" : "monthly",
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

/** URLs whose content actually changed on the latest edit day. */
export function getRecentlyEditedUrls(): string[] {
  return getPublicPaths()
    .filter((path) => lastModifiedFor(path).toISOString().startsWith(EDITED_ON))
    .map((path) => `${SITE_URL}${path}`)
}
