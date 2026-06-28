/** Curated Unsplash imagery — trades & service-business themes. */

const unsplash = (id: string, w = 1920) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

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
  plumbing: unsplash("photo-1607472586893-edb57bdc0e38", 800),
  electrical: unsplash("photo-1621905252507-b214d08b9b1a", 800),
  "auto-repair": unsplash("photo-1486260324663-41e7e79122a5", 800),
  handyman: unsplash("photo-1581578731548-c64695cc6952", 800),
  cleaning: unsplash("photo-1585421514738-01798e2a7b0d", 800),
  landscaping: unsplash("photo-1416879595882-3373a048125b", 800),
}

export function getIndustryImage(slug: string): string {
  return INDUSTRY_IMAGES[slug] ?? MARKETING_IMAGES.workflow
}

export function getIndustryImageAlt(name: string): string {
  return `${name} service business — CallGrabbr call answering`
}
