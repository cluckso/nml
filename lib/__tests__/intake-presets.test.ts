import { describe, it, expect } from "vitest"
import {
  getIntakeFieldsForTemplate,
  getIntakeTemplateMeta,
  buildIntakeTemplateGuidance,
  INTAKE_TEMPLATE_OPTIONS,
} from "../intake-presets"

describe("intake-presets", () => {
  it("exposes all template options", () => {
    expect(INTAKE_TEMPLATE_OPTIONS.length).toBeGreaterThan(3)
  })

  it("returns field presets per template", () => {
    const auto = getIntakeFieldsForTemplate("auto_repair")
    expect(auto.name.enabled).toBe(true)
    const generic = getIntakeFieldsForTemplate("generic")
    expect(generic).toBeDefined()
  })

  it("includes industry extras for auto repair", () => {
    const meta = getIntakeTemplateMeta("auto_repair")
    expect(meta.industryFields.some((f) => /year|make|model/i.test(f))).toBe(true)
  })

  it("builds template guidance for HVAC", () => {
    const guidance = buildIntakeTemplateGuidance("hvac")
    expect(guidance.toLowerCase()).toContain("hvac")
  })
})
