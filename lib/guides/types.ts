import type { FaqItem } from "@/lib/structured-data"

export type GuideSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type GuideComparisonRow = {
  label: string
  callgrabbr: string
  competitor: string
}

export type Guide = {
  slug: string
  title: string
  description: string
  /** Short eyebrow above H1 */
  eyebrow: string
  /** Primary H1 */
  headline: string
  /** Intro under H1 */
  intro: string
  sections: GuideSection[]
  /** Optional side-by-side comparison */
  comparison?: {
    competitorName: string
    rows: GuideComparisonRow[]
  }
  /** Show Basic / Growth / Platinum pricing snippet */
  showPricingSnippet: boolean
  /** Show demo unlock block */
  showDemo: boolean
  faq: FaqItem[]
  /** Related internal links */
  relatedLinks: { label: string; href: string }[]
  keywords: string[]
}
