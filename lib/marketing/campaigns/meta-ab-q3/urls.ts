import { buildCampaignUrl } from "@/lib/marketing/campaign-urls"
import { META_AB_CAMPAIGN_ID } from "./config"
import { getMetaAbVariant } from "./posts"
import type { MetaAbAdVariant } from "./types"

/** Tracked sign-up URL for a Meta ad variant (static creative). */
export function buildMetaAbSignUpUrl(variant: MetaAbAdVariant): string {
  return buildCampaignUrl({
    platform: "facebook",
    campaign: variant.utmCampaign,
    content: variant.utmContentStatic,
    useSignUp: true,
  })
}

/**
 * Week 3 primary landing: industry picker → HVAC/Plumbing funnel.
 * Instant-form thank-you URLs may still deep-link with ?industry=.
 */
export function buildMetaAbLandingUrl(variant: MetaAbAdVariant): string {
  return buildCampaignUrl({
    platform: "facebook",
    campaign: variant.utmCampaign,
    content: variant.utmContentStatic,
    path: "/start",
  })
}

export { getMetaAbVariant, META_AB_CAMPAIGN_ID }
