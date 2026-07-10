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

/** Full URL including trial next path. */
export function buildMetaAbLandingUrl(variant: MetaAbAdVariant): string {
  const base = buildMetaAbSignUpUrl(variant)
  const url = new URL(base)
  if (!url.searchParams.has("next")) {
    url.searchParams.set("next", "/trial/start")
  }
  return url.toString()
}

export { getMetaAbVariant, META_AB_CAMPAIGN_ID }
