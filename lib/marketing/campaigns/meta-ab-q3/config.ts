import type { MetaAbCampaignConfig, MetaAbRound } from "./types"

export const META_AB_CAMPAIGN_ID = "meta-ab-q3"

export const META_AB_CONFIG: MetaAbCampaignConfig = {
  campaignName: "CG_Meta_AB_Lean_15d",
  dailyBudgetUsd: 15,
  totalDays: 21,
  bidStrategy: "Lowest cost (no cost cap until 10+ conversions on one ad)",
  placements: ["Facebook Feed", "Instagram Feed", "Instagram Reels"],
  excludedPlacements: [
    "Audience Network",
    "Messenger",
    "Facebook right column",
    "Facebook Marketplace",
  ],
  geo: {
    metro: "Phoenix, AZ",
    radiusMiles: 50,
    note: "Concentrate spend in one metro at $15/day. Swap to Dallas-Fort Worth if Phoenix CPM is high.",
  },
  ageMin: 30,
  ageMax: 58,
  targetingInterests: [
    "Small business owners",
    "Heating, ventilating, and air conditioning (HVAC)",
    "Plumbing",
    "Electrician",
  ],
  killRules: {
    maxSpendNoConversionUsd: 25,
    minCtrPercent: 0.6,
  },
  objective: "Sales or Leads → Website conversions",
  conversionEvent: "Complete registration on /sign-up (trial start)",
  landingPath: "/sign-up?next=/trial/start",
}

export const META_AB_ROUNDS: MetaAbRound[] = [
  {
    id: "round-1",
    label: "Voicemail vs Competition",
    dayStart: 1,
    dayEnd: 7,
    variantIds: ["a-voicemail", "d-competition"],
    learnGoal: "Which pain hook converts: loss/voicemail vs competitor steal",
  },
  {
    id: "round-2",
    label: "Round 1 winner vs Family time",
    dayStart: 8,
    dayEnd: 14,
    variantIds: ["a-voicemail", "b-family"],
    learnGoal:
      "Note: replace a-voicemail with actual Round 1 winner ad set when launching Round 2 in Ads Manager",
  },
  {
    id: "round-3",
    label: "Champion vs Bathroom humor (optional)",
    dayStart: 15,
    dayEnd: 21,
    variantIds: ["b-family", "c-bathroom"],
    learnGoal:
      "Only run if Rounds 1–2 show promise (any signups or CPA < $40). Replace b-family with current champion.",
  },
]

export const IMAGE_NEGATIVE_PROMPT =
  "photorealistic contractor, job site, ladder, workshop, warm orange lighting, cartoon anime, cluttered text, watermark, logo, low quality"
