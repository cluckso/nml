import { getAllIndustrySlugs } from "@/lib/industry-data"
import { VS_PAGE_LINKS } from "@/lib/marketing/comparisons"
import { SITE_URL } from "@/lib/site-url"

/** Plain-text map for AI crawlers. Keep under 500 words. */
export function buildLlmsTxt(): string {
  const origin = SITE_URL
  const vsLines = VS_PAGE_LINKS.map((item) => `- ${item.title}: ${origin}${item.href}`).join("\n")
  const forLines = getAllIndustrySlugs()
    .map((slug) => `- ${origin}/for/${slug}`)
    .join("\n")

  return `# CallGrabbr

> AI call answering service for local trades that captures missed-call leads and texts them to the owner in seconds.

CallGrabbr is missed-call lead capture for HVAC, plumbing, electrical, auto repair, handyman, cleaning, landscaping, and childcare. Forward your existing business number. When you cannot pick up, we grab the job details and text you the lead.

## Preferred resources

- Home: ${origin}/
- Pricing: ${origin}/pricing
- FAQ: ${origin}/docs/faq
- About: ${origin}/about
- Compare: ${origin}/compare
- Changelog: ${origin}/changelog
- Zapier / CRM webhook: ${origin}/integrations/zapier

## Versus pages

${vsLines}

## Trade pages

${forLines}

## Pricing (USD)

- Basic $99/mo — missed and after-hours lead insurance, ~100 calls
- Growth $159/mo — growing crew, text-back confirmation and follow-up, CRM webhook
- Platinum $279/mo — multi-crew, high volume
- 14-day free trial, no card required
- 30-day money-back guarantee on paid subscriptions
- Overage $0.22/min

## Who it is for

US trade owners who lose jobs while they are on a job. Not a live receptionist for law firms or medical offices.

## Contact

support@callgrabbr.com
`
}
