import { describe, expect, it } from "vitest"
import { DEFAULT_INTAKE_FIELDS } from "../business-settings"
import {
  buildDedicatedIntakeGuidance,
  buildLeadCaptureSummary,
  industryToIntakeTemplate,
} from "../lead-capture-summary"

describe("industryToIntakeTemplate", () => {
  it("maps industries to templates", () => {
    expect(industryToIntakeTemplate("HVAC")).toBe("hvac")
    expect(industryToIntakeTemplate("AUTO_REPAIR")).toBe("auto_repair")
    expect(industryToIntakeTemplate("GENERIC")).toBe("generic")
  })
})

describe("buildLeadCaptureSummary", () => {
  it("lists required and optional fields with industry extras", () => {
    const summary = buildLeadCaptureSummary(DEFAULT_INTAKE_FIELDS, null, "HVAC")
    expect(summary.templateLabel).toBe("HVAC")
    expect(summary.required).toContain("Caller name")
    expect(summary.required).toContain("Phone number")
    expect(summary.required).toContain("Reason for call")
    expect(summary.industryExtras.length).toBeGreaterThan(0)
    expect(summary.previewLine).toMatch(/Required:/)
  })
})

describe("buildDedicatedIntakeGuidance", () => {
  it("includes required field guidance for sync", () => {
    const text = buildDedicatedIntakeGuidance(DEFAULT_INTAKE_FIELDS, "plumbing", "PLUMBING")
    expect(text).toMatch(/Lead capture/)
    expect(text).toMatch(/Required fields/)
    expect(text).toMatch(/callback number/i)
  })
})
