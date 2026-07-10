import { getAllFunnelSlugs, getFunnelConfig } from "@/lib/funnel/industry-configs"

/** Options for Meta Instant Form Q1 — label must match form answers exactly. */
export const META_FORM_INDUSTRY_OPTIONS = [
  { label: "HVAC", slug: "hvac" },
  { label: "Plumbing", slug: "plumbing" },
  { label: "Electrical", slug: "electrical" },
  { label: "Auto repair", slug: "auto-repair" },
  { label: "Handyman", slug: "handyman" },
  { label: "Roofing", slug: "roofing" },
  { label: "Law firm", slug: "lawyers" },
  { label: "Real estate", slug: "realtors" },
  { label: "Dental practice", slug: "dentists" },
  { label: "Salon", slug: "salons" },
  { label: "Other home or service business", slug: "handyman" },
] as const

export type MetaLeadPrefill = {
  source: "meta"
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  businessName?: string
}

type SearchParams = Record<string, string | string[] | undefined>

const INDUSTRY_ALIASES: Record<string, string> = {
  hvac: "hvac",
  plumbing: "plumbing",
  electrical: "electrical",
  electrician: "electrical",
  "auto-repair": "auto-repair",
  autorepair: "auto-repair",
  "auto repair": "auto-repair",
  handyman: "handyman",
  roofing: "roofing",
  roofer: "roofing",
  lawyers: "lawyers",
  lawyer: "lawyers",
  "law firm": "lawyers",
  lawfirm: "lawyers",
  legal: "lawyers",
  realtors: "realtors",
  realtor: "realtors",
  "real estate": "realtors",
  realestate: "realtors",
  "real-estate": "realtors",
  dentists: "dentists",
  dentist: "dentists",
  dental: "dentists",
  salons: "salons",
  salon: "salons",
  "other home or service business": "handyman",
  other: "handyman",
  generic: "handyman",
}

function pickParam(params: SearchParams, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = params[key]
    if (typeof raw === "string" && raw.trim()) return raw.trim()
    if (Array.isArray(raw) && raw[0]?.trim()) return raw[0].trim()
  }
  return undefined
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
}

/** Map Meta form answer, slug, or alias to a funnel slug. */
export function resolveMetaIndustrySlug(input: string | null | undefined): string | null {
  if (!input?.trim()) return null

  const normalized = normalizeKey(input)
  const validSlugs = new Set(getAllFunnelSlugs())

  if (validSlugs.has(normalized.replace(/\s+/g, "-"))) {
    return normalized.replace(/\s+/g, "-")
  }

  const fromAlias = INDUSTRY_ALIASES[normalized]
  if (fromAlias && validSlugs.has(fromAlias)) return fromAlias

  const fromOptions = META_FORM_INDUSTRY_OPTIONS.find(
    (opt) => normalizeKey(opt.label) === normalized || opt.slug === normalized.replace(/\s+/g, "-")
  )
  if (fromOptions && validSlugs.has(fromOptions.slug)) return fromOptions.slug

  return null
}

export function parseMetaLeadPrefill(params: SearchParams): MetaLeadPrefill | null {
  const from = pickParam(params, "from")
  const hasMetaSignal =
    from === "meta" ||
    Boolean(pickParam(params, "industry", "business_type", "businessType", "vertical")) ||
    Boolean(pickParam(params, "name", "full_name", "email", "phone", "company"))

  if (!hasMetaSignal) return null

  const prefill: MetaLeadPrefill = { source: "meta" }

  const contactName = pickParam(params, "name", "full_name", "contactName", "contact_name")
  const contactEmail = pickParam(params, "email", "contactEmail", "contact_email")
  const contactPhone = pickParam(params, "phone", "phone_number", "contactPhone", "contact_phone")
  const businessName = pickParam(params, "company", "company_name", "businessName", "business_name")

  if (contactName) prefill.contactName = contactName
  if (contactEmail) prefill.contactEmail = contactEmail
  if (contactPhone) prefill.contactPhone = contactPhone
  if (businessName) prefill.businessName = businessName

  return prefill
}

export function hasCompleteMetaContact(prefill: MetaLeadPrefill): boolean {
  return Boolean(
    prefill.contactName?.trim() &&
      prefill.contactEmail?.trim() &&
      prefill.contactPhone?.trim()
  )
}

/** Step ids to skip on the website when industry + contact came from Meta. */
export function getMetaSkippedStepIds(prefill: MetaLeadPrefill): string[] {
  const skipped = ["confirm"]
  if (hasCompleteMetaContact(prefill)) skipped.push("contact")
  return skipped
}

export function buildMetaPrefillValues(
  prefill: MetaLeadPrefill,
  displayName: string
): Record<string, string> {
  const values: Record<string, string> = {
    businessConfirm: "yes",
  }

  if (prefill.businessName) values.businessName = prefill.businessName
  if (prefill.contactName) values.contactName = prefill.contactName
  if (prefill.contactEmail) values.contactEmail = prefill.contactEmail
  if (prefill.contactPhone) values.contactPhone = prefill.contactPhone

  // Satisfy confirm step validation if user navigates back
  if (!values.businessName) values.businessName = displayName

  return values
}

export function buildMetaFunnelUrl(slug: string, prefill?: MetaLeadPrefill | null): string {
  const params = new URLSearchParams({ from: "meta" })

  if (prefill?.contactName) params.set("name", prefill.contactName)
  if (prefill?.contactEmail) params.set("email", prefill.contactEmail)
  if (prefill?.contactPhone) params.set("phone", prefill.contactPhone)
  if (prefill?.businessName) params.set("company", prefill.businessName)

  return `/funnel/${slug}?${params.toString()}`
}

/** Preserve UTM params when redirecting from /start to a funnel. */
export function appendUtmParams(url: string, params: SearchParams): string {
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const
  const [path, query = ""] = url.split("?")
  const search = new URLSearchParams(query)

  for (const key of utmKeys) {
    const value = pickParam(params, key)
    if (value && !search.has(key)) search.set(key, value)
  }

  const qs = search.toString()
  return qs ? `${path}?${qs}` : path
}

export function buildMetaStartRedirectUrl(
  slug: string,
  params: SearchParams,
  prefill?: MetaLeadPrefill | null
): string {
  const config = getFunnelConfig(slug)
  if (!config) return "/start"

  let url = buildMetaFunnelUrl(slug, prefill)
  url = appendUtmParams(url, params)
  return url
}

export function getMetaIndustryFromParams(params: SearchParams): string | null {
  const raw = pickParam(params, "industry", "business_type", "businessType", "vertical", "business")
  return resolveMetaIndustrySlug(raw)
}
