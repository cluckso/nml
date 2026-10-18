import { describe, expect, it } from "vitest"
import { mapIncomingArticle } from "@/lib/articles"

describe("mapIncomingArticle", () => {
  it("maps known fields and ignores extras", () => {
    const mapped = mapIncomingArticle({
      id: "ext-1",
      title: "Hello",
      slug: "hello",
      content_html: "<p>Hi</p>",
      content_markdown: "Hi",
      meta_title: "Meta",
      meta_description: "Desc",
      subtitle: "Sub",
      category: "Guides",
      author_name: "Steven",
      image_url: "https://example.com/a.jpg",
      read_time: "5 min",
      word_count: 120,
      tags: ["a"],
      faqs: [{ q: "Q", a: "A" }],
      json_ld_schema: { "@type": "Article" },
      language_code: "en",
      publish_date: "2026-10-01T12:00:00.000Z",
      updated_at: "2026-10-02T12:00:00.000Z",
      author_initials: "SS",
      hreflang_tags: ["en"],
    })

    expect(mapped).not.toBeNull()
    expect(mapped!.externalId).toBe("ext-1")
    expect(mapped!.title).toBe("Hello")
    expect(mapped!.slug).toBe("hello")
    expect(mapped!.contentHtml).toBe("<p>Hi</p>")
    expect(mapped!.publishedAt?.toISOString()).toBe("2026-10-01T12:00:00.000Z")
    expect(mapped!.tags).toEqual(["a"])
    expect(mapped).not.toHaveProperty("author_initials")
    expect(mapped).not.toHaveProperty("hreflang_tags")
  })

  it("returns null without id", () => {
    expect(mapIncomingArticle({ title: "No id" })).toBeNull()
  })
})
