const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.callgrabbr.com"
const SIGN_UP_URL = `${BASE_URL}/sign-up`

export type CampaignPlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "google_business"
  | "reels"

const PLATFORM_MEDIUM: Record<CampaignPlatform, string> = {
  facebook: "social",
  instagram: "social",
  linkedin: "social",
  twitter: "social",
  google_business: "gbp",
  reels: "reels",
}

const PLATFORM_SOURCE: Record<CampaignPlatform, string> = {
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  twitter: "twitter",
  google_business: "google",
  reels: "facebook",
}

export type CampaignUrlOptions = {
  platform: CampaignPlatform
  campaign?: string
  content?: string
  path?: string
  useSignUp?: boolean
}

/** Build a tracked campaign URL with UTM parameters. */
export function buildCampaignUrl(options: CampaignUrlOptions): string {
  const {
    platform,
    campaign = "phone-slave",
    content,
    path,
    useSignUp = false,
  } = options

  const base = useSignUp ? SIGN_UP_URL : `${BASE_URL}${path ?? ""}`
  const url = new URL(base)

  url.searchParams.set("utm_source", PLATFORM_SOURCE[platform])
  url.searchParams.set("utm_medium", PLATFORM_MEDIUM[platform])
  url.searchParams.set("utm_campaign", campaign)
  if (content) url.searchParams.set("utm_content", content)

  return url.toString()
}

export function appendCampaignLink(
  caption: string,
  options: CampaignUrlOptions
): string {
  const link = buildCampaignUrl(options)
  if (caption.includes(link)) return caption
  return `${caption.trim()}\n\n👉 ${link}`
}
