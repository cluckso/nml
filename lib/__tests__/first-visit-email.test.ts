import { describe, expect, it } from "vitest"
import { buildFirstVisitEmailHtml, firstVisitCta } from "@/lib/first-visit-email"

describe("firstVisitCta", () => {
  it("routes new signups to trial start", () => {
    const cta = firstVisitCta({
      businessId: null,
      onboardingComplete: false,
      trialStartedAt: null,
    })
    expect(cta.href).toMatch(/\/trial\/start$/)
    expect(cta.label).toMatch(/trial/i)
  })

  it("routes incomplete onboarding to /onboarding", () => {
    const cta = firstVisitCta({
      businessId: "biz_1",
      onboardingComplete: false,
      trialStartedAt: new Date(),
    })
    expect(cta.href).toMatch(/\/onboarding$/)
  })

  it("routes activated shops to greeting preview", () => {
    const cta = firstVisitCta({
      businessId: "biz_1",
      onboardingComplete: true,
      trialStartedAt: new Date(),
    })
    expect(cta.href).toContain("/settings?section=greeting")
    expect(cta.href).toContain("#preview-greeting")
  })
})

describe("buildFirstVisitEmailHtml", () => {
  it("includes name and CTA", () => {
    const html = buildFirstVisitEmailHtml({
      firstName: "Alex",
      ctaHref: "https://www.callgrabbr.com/trial/start",
      ctaLabel: "Start your free trial",
    })
    expect(html).toContain("Alex")
    expect(html).toContain("https://www.callgrabbr.com/trial/start")
    expect(html).toContain("Start your free trial")
  })
})
