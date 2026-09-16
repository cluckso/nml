/**
 * Canonical marketing lexicon for missed-call lead capture.
 * Import from here on marketing surfaces — do not invent parallel category language.
 */

/** Product category we own (peer of forms / chat / LSA — not Ruby/Rosie). */
export const CATEGORY_NAME = "missed-call lead capture"

/** Full one-liner for meta, about, and comparison pages. */
export const PRODUCT_ONE_LINER =
  "CallGrabbr is missed-call lead capture for trades — we grab the job when you can't answer, and text it to you in seconds."

/** Short footer / org schema line. */
export const FOOTER_TAGLINE = "Missed-call lead capture for local service businesses."

export const HERO_H1 = "Stop Losing Jobs to Missed Calls"

/** First 8–12 words of the hero — names category + ICP (audit D1.1 / D2.1). */
export const HERO_CATEGORY_LINE =
  "AI answering service for HVAC, plumbing, electrical, and auto shops"

export const HERO_SUB =
  "Missed-call lead capture for HVAC, plumbing, electrical, and auto — we grab the job and text it to you in seconds."

/** Primary CTA — trial (pair with trialNavCtaLabel / trialCtaLabel). */
export const PRIMARY_CTA = "Start free trial"

/** Loss-framed secondary CTA. */
export const LOSS_CTA = "See what you're losing"

/** Capture-framed secondary CTA. */
export const CAPTURE_CTA = "Capture your next missed lead free"

/** Basic SKU frame — hero plan. */
export const BASIC_FRAME = "Lead insurance (overflow + nights/weekends)"

export const BASIC_BADGE = "Lead insurance"

/** Growth / Platinum when the shop wants every ring. */
export const GROWTH_FRAME = "Full front desk when you're ready"

export const PLATINUM_FRAME = "Full front desk for busy multi-crew shops"

/**
 * Price objection vs cheaper AI answering tools (e.g. Rosie ~$49).
 * Do not race to $49 — sell $/captured job and trade intake depth.
 */
export const ROSIE_PRICE_OBJECTION =
  "Cheaper tools answer phones. CallGrabbr is built to capture trade jobs — name, address, urgency, preferred time — so you can sell the call back, not just get a transcript."

/** Buyer question every marketing page should answer. */
export const BUYER_QUESTION = "How many jobs does this put back on my board?"

/** Typical industry rates — label as such, not first-party CallGrabbr stats. */
export const VOICEMAIL_CAPTURE_RATE = "5–15%"
export const TYPICAL_CAPTURE_RATE = "80–95%"
export const HANGUP_RATE_LABEL =
  "When you miss a call, 80% of callers hang up — and dial your competitor"

/**
 * Phrases that pull us into the commodity receptionist fight.
 * "AI answering service" is allowed in the hero and title tags — buyers search that category.
 */
export const FORBIDDEN_CATEGORY_PHRASES = [
  "AI receptionist",
  "virtual receptionist",
] as const

/** Mechanism language — fine as how it works, not as the product name. */
export const ALLOWED_MECHANISM_PHRASES = [
  "answers when you can't",
  "picks up",
  "grab the job",
  "text you the lead",
] as const

export function productDefinitionSentence(): string {
  return `CallGrabbr is ${CATEGORY_NAME} for HVAC, plumbing, electrical, auto, and other local trades. When you miss a call, we grab the job details and text you the lead — usually within seconds.`
}

export function organizationDescription(): string {
  return FOOTER_TAGLINE
}

export function softwareApplicationDescription(): string {
  return `${CATEGORY_NAME} for HVAC, plumbing, auto repair, and other local service businesses. Captures job details and sends instant text or email lead summaries.`
}

export function webSiteDescription(): string {
  return `${HERO_H1}. ${HERO_SUB} One captured job pays for months.`
}
