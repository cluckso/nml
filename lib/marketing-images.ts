/** Curated Unsplash imagery — trades & service-business themes. */

const unsplash = (id: string, w = 1920) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Custom funnel / industry hero art (stored in public/marketing/funnel/). */
export const FUNNEL_HERO_IMAGES = {
  plumbing: "/marketing/funnel/plumbing.png",
  electrical: "/marketing/funnel/electrical.png",
  "auto-repair": "/marketing/funnel/auto-repair.png",
  handyman: "/marketing/funnel/handyman.png",
} as const

export const MARKETING_IMAGES = {
  hero: unsplash("photo-1621905251918-48416bd8575a"),
  workflow: unsplash("photo-1581092160562-40aa08e78837", 1600),
  whyMatters: unsplash("photo-1504307653784-9d022b245045", 1600),
  leadCapture: unsplash("photo-1556742049-0cfed4f6a45d", 1600),
  finalCta: unsplash("photo-1551434678-e076c223a692", 1920),
  teamTrust: unsplash("photo-1560250097-0b93528c311a", 1200),
} as const

export const MARKETING_IMAGE_ALT: Record<keyof typeof MARKETING_IMAGES, string> = {
  hero: "Technician answering a service call in the field",
  workflow: "Service technician using tools on a job site",
  whyMatters: "Contractor reviewing missed calls on a smartphone",
  leadCapture: "Business owner reading a lead notification on their phone",
  finalCta: "Small business team collaborating in an office",
  teamTrust: "Professional service business team meeting",
}

export const INDUSTRY_IMAGES: Record<string, string> = {
  hvac: unsplash("photo-1621905251918-48416bd8575a", 800),
  plumbing: FUNNEL_HERO_IMAGES.plumbing,
  electrical: FUNNEL_HERO_IMAGES.electrical,
  "auto-repair": FUNNEL_HERO_IMAGES["auto-repair"],
  handyman: FUNNEL_HERO_IMAGES.handyman,
  cleaning: unsplash("photo-1585421514738-01798e2a7b0d", 800),
  landscaping: unsplash("photo-1416879595882-3373a048125b", 800),
  roofing: unsplash("photo-1632759144336-25898c81d662", 800),
  lawyers: unsplash("photo-1589829545855-df5d2f4e4f0e", 800),
  realtors: unsplash("photo-1560518883-ce09059eeffa", 800),
  dentists: unsplash("photo-1629909613654-28e377c37b09", 800),
  salons: unsplash("photo-1560066984-138d9834c058", 800),
}

export function getIndustryImage(slug: string): string {
  return INDUSTRY_IMAGES[slug] ?? MARKETING_IMAGES.workflow
}

export function getIndustryImageAlt(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("plumb"))
    return "Plumber responding to an emergency call — CallGrabbr captures plumbing leads 24/7"
  if (lower.includes("electr"))
    return "Electrician on an emergency service call — CallGrabbr AI call assistant"
  if (lower.includes("auto"))
    return "Auto repair shop capturing missed-call leads with CallGrabbr"
  if (lower.includes("handyman"))
    return "Handyman on a job site — CallGrabbr turns missed calls into booked jobs"
  return `${name} service business — CallGrabbr call answering`
}
