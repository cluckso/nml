import { describe, it, expect } from "vitest"
import { PlanType } from "@prisma/client"
import {
  getRetellVoiceConfig,
  STANDARD_CARTESIA_FEMALE_VOICE_ID,
  STANDARD_CARTESIA_MALE_VOICE_ID,
} from "@/lib/retell-agent-template"
import { hasPremiumElevenLabsVoice } from "@/lib/plans"
import { buildAgentOverride } from "@/lib/agent-override"
import { DEFAULT_SETTINGS } from "@/lib/business-settings"

describe("hasPremiumElevenLabsVoice", () => {
  it("returns false for Starter regardless of premiumVoice", () => {
    expect(hasPremiumElevenLabsVoice(PlanType.STARTER, true)).toBe(false)
    expect(hasPremiumElevenLabsVoice(PlanType.STARTER, false)).toBe(false)
  })

  it("returns false for Pro without premiumVoice add-on", () => {
    expect(hasPremiumElevenLabsVoice(PlanType.PRO, false)).toBe(false)
    expect(hasPremiumElevenLabsVoice(PlanType.PRO)).toBe(false)
  })

  it("returns true for Pro with premiumVoice add-on", () => {
    expect(hasPremiumElevenLabsVoice(PlanType.PRO, true)).toBe(true)
  })

  it("returns true for Elite and Local Plus always", () => {
    expect(hasPremiumElevenLabsVoice(PlanType.ELITE)).toBe(true)
    expect(hasPremiumElevenLabsVoice(PlanType.LOCAL_PLUS)).toBe(true)
    expect(hasPremiumElevenLabsVoice(PlanType.ELITE, false)).toBe(true)
  })
})

describe("getRetellVoiceConfig", () => {
  it("uses Cartesia for Starter", () => {
    const config = getRetellVoiceConfig(PlanType.STARTER)
    expect(config.voice_id).toBe(STANDARD_CARTESIA_FEMALE_VOICE_ID)
  })

  it("uses Cartesia male voice when gender is male on Starter", () => {
    const config = getRetellVoiceConfig(PlanType.STARTER, "male")
    expect(config.voice_id).toBe(STANDARD_CARTESIA_MALE_VOICE_ID)
  })

  it("uses Cartesia for Pro without premiumVoice", () => {
    const config = getRetellVoiceConfig(PlanType.PRO, "female", false)
    expect(config.voice_id).toBe(STANDARD_CARTESIA_FEMALE_VOICE_ID)
  })

  it("uses ElevenLabs for Pro with premiumVoice", () => {
    const config = getRetellVoiceConfig(PlanType.PRO, "female", true)
    expect(config.voice_id).toBe("11labs-Chloe")
  })

  it("uses ElevenLabs Ethan for Pro premium male", () => {
    const config = getRetellVoiceConfig(PlanType.PRO, "male", true)
    expect(config.voice_id).toBe("11labs-Ethan")
  })

  it("uses ElevenLabs for Elite regardless of premiumVoice flag", () => {
    const config = getRetellVoiceConfig(PlanType.ELITE, "female", false)
    expect(config.voice_id).toBe("11labs-Chloe")
  })
})

describe("buildAgentOverride voice tiering", () => {
  it("wires Pro premiumVoice to ElevenLabs voice_id", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      greeting: { ...DEFAULT_SETTINGS.greeting, premiumVoice: true, voiceGender: "female" as const },
    }
    const { agentOverride } = buildAgentOverride(settings, "Acme", [], PlanType.PRO)
    expect(agentOverride.agent?.voice_id).toBe("11labs-Chloe")
  })

  it("keeps Pro on Cartesia when premiumVoice is off", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      greeting: { ...DEFAULT_SETTINGS.greeting, premiumVoice: false, voiceGender: "female" as const },
    }
    const { agentOverride } = buildAgentOverride(settings, "Acme", [], PlanType.PRO)
    expect(agentOverride.agent?.voice_id).toBe(STANDARD_CARTESIA_FEMALE_VOICE_ID)
  })
})
