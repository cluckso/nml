import { Industry } from "@prisma/client"
import { getIndustryLandingBySlug } from "@/lib/industry-data"

/** Contact + industry captured on funnel completion for trial/onboarding pre-fill. */
export interface FunnelTrialContext {
  industry: string
  displayName?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  leadId?: string
  submittedAt: number
}

const STORAGE_KEY = "callgrabbr_funnel_trial"
/** Context expires after 24 hours. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export function funnelSlugToIndustry(slug: string): Industry {
  const landing = getIndustryLandingBySlug(slug.toLowerCase())
  if (landing?.industry) return landing.industry
  return Industry.GENERIC
}

export function saveFunnelTrialContext(
  ctx: Omit<FunnelTrialContext, "submittedAt">
): void {
  if (typeof window === "undefined") return
  try {
    const payload: FunnelTrialContext = { ...ctx, submittedAt: Date.now() }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function loadFunnelTrialContext(): FunnelTrialContext | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FunnelTrialContext
    if (!parsed?.industry || typeof parsed.submittedAt !== "number") return null
    if (Date.now() - parsed.submittedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearFunnelTrialContext(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function buildFunnelTrialStartUrl(industry: string): string {
  const params = new URLSearchParams({ from: "funnel", industry })
  return `/trial/start?${params.toString()}`
}
