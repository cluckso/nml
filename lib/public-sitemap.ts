import type { MetadataRoute } from "next"
import { listArticleSitemapEntries } from "@/lib/articles"
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
  "/blog": EDITED_ON,
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

export async function getPublicSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = getPublicPaths().map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModifiedFor(path),
    changeFrequency: path === "" ? "weekly" : path === "/blog" ? "daily" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/blog"
          ? 0.8
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

  let articleEntries: MetadataRoute.Sitemap = []
  try {
    const articles = await listArticleSitemapEntries()
    articleEntries = articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("sitemap: failed to load articles", error)
  }

  return [...staticEntries, ...articleEntries]
}

/** URLs whose content actually changed on the latest edit day. */
export function getRecentlyEditedUrls(): string[] {
  return getPublicPaths()
    .filter((path) => lastModifiedFor(path).toISOString().startsWith(EDITED_ON))
    .map((path) => `${SITE_URL}${path}`)
}
