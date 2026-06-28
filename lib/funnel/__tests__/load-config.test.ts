import { describe, expect, it } from "vitest"
import {
  FUNNEL_CONFIGS,
  getAllFunnelSlugs,
  getFunnelConfig,
} from "../industry-configs"

const REQUIRED_SLUGS = [
  "hvac",
  "plumbing",
  "electrical",
  "auto-repair",
  "handyman",
  "roofing",
  "lawyers",
  "realtors",
  "dentists",
  "salons",
]

describe("funnel config loader", () => {
  it("returns all required industry slugs", () => {
    const slugs = getAllFunnelSlugs()
    for (const slug of REQUIRED_SLUGS) {
      expect(slugs).toContain(slug)
    }
    expect(slugs.length).toBe(REQUIRED_SLUGS.length)
  })

  it("loads config by slug (case insensitive)", () => {
    const config = getFunnelConfig("HVAC")
    expect(config).toBeDefined()
    expect(config?.displayName).toBe("HVAC")
    expect(config?.steps.length).toBeGreaterThanOrEqual(3)
  })

  it("each config has required fields and valid steps", () => {
    for (const config of FUNNEL_CONFIGS) {
      expect(config.slug).toBeTruthy()
      expect(config.headline).toBeTruthy()
      expect(config.averageSale).toBeGreaterThan(0)
      expect(config.missedCallRate).toBeGreaterThan(0)
      expect(config.missedCallRate).toBeLessThanOrEqual(1)
      expect(config.steps.length).toBeGreaterThanOrEqual(3)
      expect(config.cta.label).toBeTruthy()

      for (const step of config.steps) {
        expect(step.fields.length).toBeGreaterThan(0)
      }
    }
  })

  it("maps plumbing slug correctly", () => {
    const plumbing = getFunnelConfig("plumbing")
    expect(plumbing?.displayName).toBe("Plumbing")
  })
})
