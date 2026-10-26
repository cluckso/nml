import { describe, expect, it } from "vitest"
import robots from "@/app/robots"
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

  it("robots.txt disallows private prefixes and points at the www sitemap", () => {
    const config = robots()
    const disallow = Array.isArray(config.rules)
      ? config.rules.flatMap((rule) =>
          Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []
        )
      : Array.isArray(config.rules.disallow)
        ? config.rules.disallow
        : config.rules.disallow
          ? [config.rules.disallow]
          : []
    for (const blocked of SITEMAP_BLOCKLIST_PREFIXES) {
      expect(disallow, blocked).toContain(blocked)
    }
    expect(config.sitemap).toBe(SITEMAP_URL)
  })
})
