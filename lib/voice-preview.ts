import type { GreetingSettings, VoiceBrandSettings } from "./business-settings"
import { buildAgentOverride } from "./agent-override"
import { mergeWithDefaults, type BusinessSettings } from "./business-settings"
import { PlanType } from "@prisma/client"

export type VoicePreviewInput = {
  greeting?: Partial<GreetingSettings>
  voiceBrand?: Partial<VoiceBrandSettings>
  businessName: string
  planType?: PlanType | null
  sampleText?: string
}

export type VoicePreviewResult = {
  text: string
  beginMessage: string
  voiceSpeed: number
  voiceSummary: string
  usesPremiumVoice: boolean
}

export function buildVoicePreview(input: VoicePreviewInput): VoicePreviewResult {
  const base = mergeWithDefaults(null)
  const settings: BusinessSettings = {
    ...base,
    greeting: { ...base.greeting, ...(input.greeting ?? {}) },
    voiceBrand: { ...base.voiceBrand, ...(input.voiceBrand ?? {}) },
  }
  const businessName =
    settings.greeting.businessNamePronunciation?.trim() ||
    input.businessName.trim() ||
    "our office"

  const { beginMessage, agentOverride } = buildAgentOverride(
    settings,
    businessName,
    [],
    input.planType ?? PlanType.STARTER
  )

  const text =
    input.sampleText?.trim() ||
    beginMessage ||
    `Hi, thanks for calling ${businessName}! Who am I speaking with today?`

  const voiceSpeed = Number(agentOverride.agent?.voice_speed ?? 1)
  const warmth = settings.voiceBrand.warmth
  const conciseness = settings.voiceBrand.conciseness
  const voiceId = String(agentOverride.agent?.voice_id ?? "")

  const voiceSummary = [
    voiceId.includes("11labs") ? "Premium ElevenLabs voice" : "Standard voice",
    `Speed ${Math.round(voiceSpeed * 100)}%`,
    `Warmth ${Math.round(warmth * 100)}%`,
    `Conciseness ${Math.round(conciseness * 100)}%`,
  ].join(" · ")

  return {
    text,
    beginMessage,
    voiceSpeed,
    voiceSummary,
    usesPremiumVoice: voiceId.includes("11labs"),
  }
}
