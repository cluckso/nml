import { describe, expect, it, vi } from "vitest"
import robots from "@/app/robots"
import { GET as getSitemap } from "@/app/sitemap.xml/route"
import { getPublicPaths } from "@/lib/public-sitemap"
import {
  SITEMAP_BLOCKLIST_PREFIXES,
  SITEMAP_MUST_INCLUDE,
  SITEMAP_URL,
  ROBOTS_URL,
  SEARCH_CONSOLE_PROPERTY,
  GA4_MEASUREMENT_ID,
} from "@/lib/seo-monitoring"
import { SITE_URL } from "@/lib/site-url"

vi.mock("@/lib/articles", () => ({
  listArticleSitemapEntries: vi.fn(async () => []),
}))

describe("SEO crawl config (KAN-12)", () => {
  it("uses www canonical URLs for monitoring endpoints", () => {
    expect(SEARCH_CONSOLE_PROPERTY).toBe(SITE_URL)
    expect(SITEMAP_URL).toBe(`${SITE_URL}/sitemap.xml`)
    expect(ROBOTS_URL).toBe(`${SITE_URL}/robots.txt`)
    expect(SITE_URL).toMatch(/^https:\/\/www\./)
  })

  it("keeps GA4 measurement id configured", () => {
    expect(GA4_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]+$/)
  })

  it("includes core marketing paths in the public sitemap path list", () => {
    const paths = getPublicPaths()
    for (const required of SITEMAP_MUST_INCLUDE) {
      expect(paths, required).toContain(required)
    }
  })

  it("never lists private app paths in the public sitemap path list", () => {
    const paths = getPublicPaths()
    for (const path of paths) {
      for (const blocked of SITEMAP_BLOCKLIST_PREFIXES) {
        if (blocked.endsWith("/")) {
          expect(path.startsWith(blocked) || path === blocked.slice(0, -1), path).toBe(false)
        } else {
          expect(path === blocked || path.startsWith(`${blocked}/`), path).toBe(false)
        }
      }
    }
  })

  it("robots.txt permits public crawling, disallows private prefixes, and points at the www sitemap", () => {
    const config = robots()
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const disallow = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []
    )
    expect(rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: "/" }),
      ])
    )
    for (const blocked of SITEMAP_BLOCKLIST_PREFIXES) {
      expect(disallow, blocked).toContain(blocked)
    }
    expect(config.sitemap).toBe(SITEMAP_URL)
  })

  it("serves an XML sitemap containing public URLs and no private paths", async () => {
    const response = await getSitemap()
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("application/xml")
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(body).toContain("</urlset>")

    for (const required of SITEMAP_MUST_INCLUDE) {
      expect(body).toContain(`<loc>${SITE_URL}${required}</loc>`)
    }

    const urls = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url === SITE_URL || url.startsWith(`${SITE_URL}/`), url).toBe(true)
      const path = url.replace(SITE_URL, "")
      for (const blocked of SITEMAP_BLOCKLIST_PREFIXES) {
        if (blocked.endsWith("/")) {
          expect(path.startsWith(blocked) || path === blocked.slice(0, -1), url).toBe(false)
        } else {
          expect(path === blocked || path.startsWith(`${blocked}/`), url).toBe(false)
        }
      }
    }
  })
})
