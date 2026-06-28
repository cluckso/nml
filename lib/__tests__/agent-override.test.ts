import { describe, it, expect } from "vitest"
import {
  buildAgentOverride,
  buildStrictnessGuidance,
  buildWarmthGuidance,
  buildQuestionDepthGuidance,
  computeModelTemperature,
} from "@/lib/agent-override"
import { DEFAULT_SETTINGS } from "@/lib/business-settings"
import { PlanType } from "@prisma/client"

describe("buildStrictnessGuidance", () => {
  it("returns conversational guidance at low strictness", () => {
    expect(buildStrictnessGuidance(0.2)).toMatch(/natural and flexible/i)
  })

  it("returns strict checklist guidance at high strictness", () => {
    expect(buildStrictnessGuidance(0.8)).toMatch(/checklist in order/i)
  })
})

describe("buildWarmthGuidance", () => {
  it("returns warm guidance at high warmth", () => {
    expect(buildWarmthGuidance(0.8)).toMatch(/warm and personable/i)
  })

  it("returns professional guidance at low warmth", () => {
    expect(buildWarmthGuidance(0.2)).toMatch(/polished, professional/i)
  })
})

describe("buildQuestionDepthGuidance", () => {
  it("maps fast depth to minimal questions", () => {
    expect(buildQuestionDepthGuidance("fast")).toMatch(/only essential/i)
  })

  it("maps deep depth to thorough follow-ups", () => {
    expect(buildQuestionDepthGuidance("deep")).toMatch(/thorough follow-ups/i)
  })
})

describe("computeModelTemperature", () => {
  it("is higher when conversational and warm", () => {
    const strict = computeModelTemperature(0.8, 0.3, 0.5, true, 0.88)
    const relaxed = computeModelTemperature(0.2, 0.8, 0.5, true, 0.88)
    expect(relaxed).toBeGreaterThan(strict)
  })
})

describe("buildAgentOverride", () => {
  it("includes strictness and warmth guidance in dynamic vars", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      voiceBrand: { ...DEFAULT_SETTINGS.voiceBrand, strictness: 0.8, warmth: 0.9 },
    }
    const { dynamicVars } = buildAgentOverride(settings, "Acme HVAC", ["Madison"], PlanType.ELITE)
    expect(dynamicVars.strictness_guidance).toMatch(/checklist in order/i)
    expect(dynamicVars.warmth_guidance).toMatch(/warm and personable/i)
  })

  it("uses aligned default interruption sensitivity", () => {
    const { agentOverride } = buildAgentOverride(DEFAULT_SETTINGS, "Acme", [], PlanType.STARTER)
    expect(agentOverride.agent?.interruption_sensitivity).toBe(0.6)
  })

  it("wires question depth to behavior guidance", () => {
    const settings = { ...DEFAULT_SETTINGS, questionDepth: "fast" as const }
    const { dynamicVars } = buildAgentOverride(settings, "Acme", [], PlanType.PRO)
    expect(dynamicVars.question_depth_guidance).toMatch(/only essential/i)
  })
})
