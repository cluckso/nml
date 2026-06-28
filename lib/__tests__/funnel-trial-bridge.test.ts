import { describe, expect, it } from "vitest"
import { Industry } from "@prisma/client"
import { funnelSlugToIndustry } from "@/lib/funnel/funnel-trial-bridge"

describe("funnelSlugToIndustry", () => {
  it("maps known landing slugs to Prisma Industry", () => {
    expect(funnelSlugToIndustry("hvac")).toBe(Industry.HVAC)
    expect(funnelSlugToIndustry("plumbing")).toBe(Industry.PLUMBING)
    expect(funnelSlugToIndustry("electrical")).toBe(Industry.ELECTRICIAN)
    expect(funnelSlugToIndustry("auto-repair")).toBe(Industry.AUTO_REPAIR)
    expect(funnelSlugToIndustry("handyman")).toBe(Industry.HANDYMAN)
  })

  it("falls back to GENERIC for funnel-only verticals", () => {
    expect(funnelSlugToIndustry("roofing")).toBe(Industry.GENERIC)
    expect(funnelSlugToIndustry("lawyers")).toBe(Industry.GENERIC)
  })
})
