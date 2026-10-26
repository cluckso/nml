import { describe, expect, it } from "vitest"
import { getAllGuides } from "@/lib/guides"
import { guideLimitsPlainText } from "@/lib/guides/limits-copy"
import { getIndustryLandingBySlug } from "@/lib/industry-data"
import { HERO_H1 } from "@/lib/marketing/positioning"
import { guideDocumentTitle, homePageMetadata, industryPageMetadata } from "@/lib/seo"
import { siteMetaDescription } from "@/lib/trial-marketing"

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

  it("keeps industry meta titles 30-60 and descriptions 110-160", () => {
    const slugs = [
      "hvac",
      "plumbing",
      "electrical",
      "auto-repair",
      "handyman",
      "childcare",
      "cleaning",
      "landscaping",
    ]
    for (const slug of slugs) {
      const landing = getIndustryLandingBySlug(slug)!
      const meta = industryPageMetadata({
        headline: landing.headline,
        subheadline: landing.subheadline,
        slug,
        industryName: landing.name,
        metaTitle: landing.metaTitle,
        metaDescription: landing.metaDescription,
      })
      expect(String(meta.title).length, `${slug} title`).toBeGreaterThanOrEqual(30)
      expect(String(meta.title).length, `${slug} title`).toBeLessThanOrEqual(60)
      expect(String(meta.description).length, `${slug} description`).toBeGreaterThanOrEqual(110)
      expect(String(meta.description).length, `${slug} description`).toBeLessThanOrEqual(160)
    }
  })

  it("keeps hub titles 30-60, descriptions 110-160, and home H1 aligned", () => {
    const hubs: { name: string; title: string; description: string }[] = [
      {
        name: "home",
        title: String(homePageMetadata().title),
        description: siteMetaDescription(),
      },
      {
        name: "pricing",
        title: "Missed-Call Lead Capture Pricing | CallGrabbr",
        description:
          "Basic $99, Growth $189, Platinum $279. Missed-call lead capture for HVAC and trades. 14-day or 40-min free trial. 30-day money-back.",
      },
      {
        name: "faq",
        title: "Missed-Call Lead Capture FAQ | CallGrabbr",
        description:
          "Missed-call and after-hours lead capture FAQ for HVAC and plumbing. Call forwarding for AT&T, Verizon, T-Mobile. Pricing, trial, and setup.",
      },
      {
        name: "compare",
        title: "Compare CallGrabbr vs AI Answering & Receptionists",
        description:
          "Side-by-side missed-call lead capture vs Ruby, Rosie, Smith.ai, OnCrew, Broccoli, and live receptionists for HVAC and plumbing shops.",
      },
      {
        name: "about",
        title: "About CallGrabbr — Why I built this",
        description:
          "Why CallGrabbr exists: missed-call lead capture for HVAC, plumbing, and local trades — grab the job when you can't answer and text it in seconds.",
      },
      {
        name: "guides",
        title: "Contractor Missed-Call Guides | CallGrabbr",
        description:
          "Comparisons and buyer guides for HVAC and plumbing shops: missed-call lead capture, vs Ruby, Smith.ai, Rosie, OnCrew, and after-hours cost.",
      },
      {
        name: "blog",
        title: "Missed-Call Lead Capture Blog | CallGrabbr",
        description:
          "Practical notes on missed-call lead capture for HVAC, plumbing, and local trades — after-hours answering, forwarding, and speed-to-lead tips.",
      },
    ]
    for (const hub of hubs) {
      expect(hub.title.length, `${hub.name} title`).toBeGreaterThanOrEqual(30)
      expect(hub.title.length, `${hub.name} title`).toBeLessThanOrEqual(60)
      expect(hub.description.length, `${hub.name} description`).toBeGreaterThanOrEqual(110)
      expect(hub.description.length, `${hub.name} description`).toBeLessThanOrEqual(160)
    }
    expect(String(homePageMetadata().title)).toContain(HERO_H1)
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
