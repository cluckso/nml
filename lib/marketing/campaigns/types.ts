import type { CampaignPlatform } from "@/lib/marketing/campaign-urls"

export type CampaignIndustry = "general" | "hvac" | "plumbing" | "electrical"

export type PostFormat =
  | "carousel"
  | "quote"
  | "before_after"
  | "reel"
  | "story"
  | "single"
  | "thread"
  | "google_business"
  | "engagement"

export type CampaignPost = {
  id: string
  industry: CampaignIndustry
  format: PostFormat
  title: string
  caption: string
  hashtags?: string[]
  /** On-image or carousel slide text (Canva merge fields). */
  slides?: Array<{ headline: string; body?: string; sub?: string }>
  googleBusiness?: { headline: string; body: string; cta?: string }
  /** Short lines for Reel/Story overlays. */
  overlays?: string[]
  thread?: string[]
  boost?: boolean
}

export type ScheduledEntry = {
  day: number
  platform: CampaignPlatform | CampaignPlatform[]
  format: PostFormat
  industry: CampaignIndustry
  postId: string
  /** Local post time as HH:mm (24h). */
  time: string
  notes?: string
}
