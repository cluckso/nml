import { describe, expect, it } from "vitest"
import { keywordsForPath, SEARCH_INTENTS, SHARED_SEO_KEYWORDS } from "@/lib/seo-keywords"

describe("seo keyword intent map", () => {
  it("covers core marketing paths", () => {
    const paths = SEARCH_INTENTS.map((item) => item.path)
    for (const required of ["/", "/pricing", "/compare", "/guides", "/for/hvac", "/docs/faq"]) {
      expect(paths).toContain(required)
    }
  })

  it("returns shared keywords plus path intent", () => {
    const pricing = keywordsForPath("/pricing")
    expect(pricing).toEqual(expect.arrayContaining([...SHARED_SEO_KEYWORDS]))
    expect(pricing).toContain("missed call lead capture pricing")
  })
})
