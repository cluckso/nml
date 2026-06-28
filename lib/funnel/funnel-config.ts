/** Types for JSON-driven marketing funnels per industry vertical. */

export type FunnelFieldType = "select" | "radio" | "text" | "email" | "phone" | "number"

export interface FunnelFieldOption {
  value: string
  label: string
  /** Optional lead score weight for this answer */
  score?: number
}

export interface FunnelStepField {
  id: string
  type: FunnelFieldType
  label: string
  placeholder?: string
  required?: boolean
  options?: FunnelFieldOption[]
}

export interface FunnelStep {
  id: string
  title: string
  subtitle?: string
  fields: FunnelStepField[]
}

export interface FunnelTestimonial {
  quote: string
  author: string
  role?: string
}

export type FunnelCtaType = "trial" | "calendly"

export interface FunnelCta {
  type: FunnelCtaType
  label: string
}

export interface FunnelConfig {
  slug: string
  displayName: string
  icon: string
  headline: string
  subheadline: string
  painPoint: string
  averageSale: number
  /** Fraction of inbound calls missed (0–1), e.g. 0.28 = 28% */
  missedCallRate: number
  heroImage?: string
  exampleTranscript?: string
  callSummary?: string
  testimonial?: FunnelTestimonial
  steps: FunnelStep[]
  /** fieldId → optionValue → score */
  leadScoring?: Record<string, Record<string, number>>
  cta: FunnelCta
}

export interface FunnelLeadPayload {
  industry: string
  responses: Record<string, string>
  score: number
  roiSnapshot?: {
    callsPerWeek: number
    missedRevenuePerMonth: number
    recoveredRevenuePerMonth: number
  }
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
}
