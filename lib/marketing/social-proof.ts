/**
 * Homepage trust artifacts. Empty until real customers opt in.
 * Do not invent names, quotes, photos, or counts.
 */
export type CustomerStory = {
  quote: string
  name: string
  role: string
  photoSrc?: string
  initials: string
}

export const CUSTOMER_STORIES: CustomerStory[] = []

/** Real paying-customer count. Null until a verified number exists. */
export const CUSTOMER_COUNT: number | null = null

export const CUSTOMER_COUNT_NOUN = "local service businesses"

export const TESTIMONIAL_REQUEST_EMAIL = "support@callgrabbr.com"

export function customerCountLabel(): string | null {
  if (CUSTOMER_COUNT == null || CUSTOMER_COUNT < 1) return null
  return `Trusted by ${CUSTOMER_COUNT} ${CUSTOMER_COUNT_NOUN}`
}
