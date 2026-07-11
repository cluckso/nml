import { describe, it, expect } from "vitest"
import {
  META_AB_CONFIG,
  META_AB_ROUNDS,
  getMetaAbVariant,
  listMetaAbVariants,
  buildMetaAbLandingUrl,
} from "@/lib/marketing/campaigns/meta-ab-q3"

describe("meta-ab-q3 campaign", () => {
  it("has lean $15/day budget config", () => {
    expect(META_AB_CONFIG.dailyBudgetUsd).toBe(15)
    expect(META_AB_CONFIG.killRules.maxSpendNoConversionUsd).toBe(25)
  })

  it("defines 4 variants with required Meta fields", () => {
    const variants = listMetaAbVariants()
    expect(variants).toHaveLength(4)
    for (const v of variants) {
      expect(v.headline.length).toBeGreaterThan(0)
      expect(v.primaryText).toContain("CallGrabbr")
      expect(v.creative.assetFile).toMatch(/^creatives\//)
    }
  })

  it("round 1 pairs voicemail vs competition only", () => {
    const r1 = META_AB_ROUNDS.find((r) => r.id === "round-1")
    expect(r1?.variantIds).toEqual(["a-voicemail", "d-competition"])
  })

  it("builds tracked landing URLs to /start with UTMs", () => {
    const v = getMetaAbVariant("a-voicemail")
    const url = buildMetaAbLandingUrl(v)
    expect(url).toContain("utm_campaign=meta-ab-voicemail")
    expect(url).toContain("utm_content=h1-static")
    expect(url).toContain("/start")
  })

  it("includes deferred reels storyboards on all variants", () => {
    for (const v of listMetaAbVariants()) {
      expect(v.reels?.storyboard.length).toBeGreaterThan(0)
      expect(v.reels?.durationSeconds).toBe(15)
    }
  })

  it("uses CallGrabbr spelling not CallGrabber", () => {
    for (const v of listMetaAbVariants()) {
      expect(v.primaryText).not.toContain("CallGrabber")
    }
  })
})
