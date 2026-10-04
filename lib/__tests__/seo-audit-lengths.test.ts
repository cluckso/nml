import { describe, expect, it } from "vitest"
import { getAllGuides } from "@/lib/guides"
import { EDITORIAL_DISCLOSURE } from "@/lib/guides/authorship"
import { guideLimitsPlainText } from "@/lib/guides/limits-copy"
import { getIndustryLandingBySlug } from "@/lib/industry-data"
import { guideDocumentTitle, industryPageMetadata } from "@/lib/seo"

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function guideWordCount(slug: string): number {
  const guide = getAllGuides().find((item) => item.slug === slug)
  if (!guide) return 0
  const parts = [
    guide.headline,
    guide.intro,
    ...guide.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]),
    ...guide.faq.flatMap((item) => [item.question, item.answer]),
    guideLimitsPlainText(),
    EDITORIAL_DISCLOSURE,
    ...(guide.sources ?? []).map((source) => `${source.name} ${source.usedFor}`),
  ]
  return words(parts.join(" "))
}

describe("audit title and description lengths", () => {
  it("keeps guide titles at 30-60 rendered characters and descriptions at 110-160", () => {
    for (const guide of getAllGuides()) {
      const title = guideDocumentTitle(guide.title)
      expect(title.length, title).toBeGreaterThanOrEqual(30)
      expect(title.length, title).toBeLessThanOrEqual(60)
      expect(guide.description.length, guide.slug).toBeGreaterThanOrEqual(110)
      expect(guide.description.length, guide.slug).toBeLessThanOrEqual(160)
    }
  })

  it("keeps landscaping title and plumbing description in range", () => {
    const landscaping = getIndustryLandingBySlug("landscaping")!
    const plumbing = getIndustryLandingBySlug("plumbing")!
    const landMeta = industryPageMetadata({
      headline: landscaping.headline,
      subheadline: landscaping.subheadline,
      slug: "landscaping",
      industryName: landscaping.name,
      metaTitle: landscaping.metaTitle,
      metaDescription: landscaping.metaDescription,
    })
    const plumbMeta = industryPageMetadata({
      headline: plumbing.headline,
      subheadline: plumbing.subheadline,
      slug: "plumbing",
      industryName: plumbing.name,
      metaTitle: plumbing.metaTitle,
      metaDescription: plumbing.metaDescription,
    })
    expect(String(landMeta.title).length).toBeGreaterThanOrEqual(30)
    expect(String(landMeta.title).length).toBeLessThanOrEqual(60)
    expect(String(plumbMeta.description).length).toBeGreaterThanOrEqual(110)
    expect(String(plumbMeta.description).length).toBeLessThanOrEqual(160)
  })

  it("gives each flagged guide at least 800 words", () => {
    const thin = [
      "callgrabbr-vs-ruby",
      "callgrabbr-vs-smith-ai",
      "best-ai-answering-for-hvac-2026",
      "after-hours-answering-cost-for-contractors",
      "callgrabbr-vs-rosie",
      "callgrabbr-vs-oncrew",
      "best-ai-answering-for-plumbing-2026",
      "ai-vs-live-answering-for-contractors",
    ]
    for (const slug of thin) {
      expect(guideWordCount(slug), slug).toBeGreaterThanOrEqual(800)
    }
  })
})
