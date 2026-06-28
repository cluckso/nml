/** Local marketing imagery — stored under public/marketing/. */

const section = (name: string) => `/marketing/sections/${name}.png`
const industry = (slug: string) => `/marketing/industries/${slug}.png`

/** Custom funnel hero art with marketing overlays (funnel pages only). */
export const FUNNEL_HERO_IMAGES = {
  plumbing: "/marketing/funnel/plumbing.png",
  electrical: "/marketing/funnel/electrical.png",
  "auto-repair": "/marketing/funnel/auto-repair.png",
  handyman: "/marketing/funnel/handyman.png",
} as const

/** Homepage section backdrops and hero. */
export const MARKETING_IMAGES = {
  hero: section("hero"),
  workflow: section("workflow"),
  whyMatters: section("why-matters"),
  leadCapture: section("lead-capture"),
  finalCta: section("final-cta"),
  teamTrust: section("team-trust"),
} as const

export const MARKETING_IMAGE_ALT: Record<keyof typeof MARKETING_IMAGES, string> = {
  hero: "Service technician taking a customer call in the field",
  workflow: "Technician working on a service job",
  whyMatters: "Contractor reviewing missed calls on a smartphone",
  leadCapture: "Business owner reading a lead notification on their phone",
  finalCta: "Small business team collaborating",
  teamTrust: "Professional service business team",
}

/** Satisfied professional portraits for homepage industry cards. */
export const INDUSTRY_CARD_IMAGES: Record<string, string> = {
  hvac: industry("hvac"),
  plumbing: industry("plumbing"),
  electrical: industry("electrical"),
  "auto-repair": industry("auto-repair"),
  handyman: industry("handyman"),
  cleaning: industry("cleaning"),
  landscaping: industry("landscaping"),
}

/** Default industry imagery (funnel heroes where available, else local portraits). */
export const INDUSTRY_IMAGES: Record<string, string> = {
  hvac: industry("hvac"),
  plumbing: FUNNEL_HERO_IMAGES.plumbing,
  electrical: FUNNEL_HERO_IMAGES.electrical,
  "auto-repair": FUNNEL_HERO_IMAGES["auto-repair"],
  handyman: FUNNEL_HERO_IMAGES.handyman,
  cleaning: industry("cleaning"),
  landscaping: industry("landscaping"),
  roofing: industry("roofing"),
  lawyers: industry("lawyers"),
  realtors: industry("realtors"),
  dentists: industry("dentists"),
  salons: industry("salons"),
}

export function getIndustryCardImage(slug: string): string {
  return INDUSTRY_CARD_IMAGES[slug] ?? industry(slug)
}

export function getIndustryImage(slug: string): string {
  return INDUSTRY_IMAGES[slug] ?? industry(slug)
}

export function getIndustryImageAlt(name: string): string {
  return `${name} service professional smiling, ready to help customers`
}
