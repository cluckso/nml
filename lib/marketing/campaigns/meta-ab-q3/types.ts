/** Meta Ads A/B campaign — lean $15/day sequential test (Q3). */

export type MetaAbVariantId = "a-voicemail" | "b-family" | "c-bathroom" | "d-competition"

export type MetaAbRoundId = "round-1" | "round-2" | "round-3"

export type MetaAbCreativeFormat = "static-1x1" | "static-4x5" | "reels-9x16"

export type MetaAbAdVariant = {
  id: MetaAbVariantId
  adSetName: string
  /** Meta link headline (≤40 chars ideal) */
  headline: string
  description: string
  primaryText: string
  cta: "SIGN_UP" | "LEARN_MORE"
  utmCampaign: string
  utmContentStatic: string
  creative: {
    format: MetaAbCreativeFormat
    canvaOverlay: { headline: string; sub?: string; badge?: string }
    imagePrompt: string
    negativePrompt: string
    /** Relative path under campaign-exports after generation */
    assetFile?: string
  }
  /** Reels deferred until winner — storyboard for post-test production */
  reels?: {
    scriptName: string
    durationSeconds: number
    storyboard: Array<{ time: string; visual: string; caption: string }>
    videoPrompt: string
  }
}

export type MetaAbRound = {
  id: MetaAbRoundId
  label: string
  dayStart: number
  dayEnd: number
  variantIds: [MetaAbVariantId, MetaAbVariantId]
  learnGoal: string
}

export type MetaAbCampaignConfig = {
  campaignName: string
  dailyBudgetUsd: number
  totalDays: number
  bidStrategy: string
  placements: string[]
  excludedPlacements: string[]
  geo: { metro: string; radiusMiles: number; note: string }
  ageMin: number
  ageMax: number
  targetingInterests: string[]
  killRules: { maxSpendNoConversionUsd: number; minCtrPercent: number }
  objective: string
  conversionEvent: string
  landingPath: string
}
