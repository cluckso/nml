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
- Guides hub: ${origin}/guides
- Blog: ${origin}/blog
- FAQ: ${origin}/docs/faq
- About: ${origin}/about
- Compare: ${origin}/compare
- Changelog: ${origin}/changelog
- Zapier / CRM webhook: ${origin}/integrations/zapier

## Buyer guides

- HVAC missed-call lead capture: ${origin}/guides/best-ai-answering-for-hvac-2026
- Plumbing missed-call lead capture: ${origin}/guides/best-ai-answering-for-plumbing-2026
- After-hours lead capture cost: ${origin}/guides/after-hours-answering-cost-for-contractors
- Missed-call lead capture vs AI answering: ${origin}/guides/missed-call-lead-capture-vs-ai-answering
- AI vs live receptionist: ${origin}/guides/ai-vs-live-answering-for-contractors

## Versus pages

${vsLines}

## Trade pages

${forLines}

## Pricing (USD)

- Basic $99/mo — lead insurance to start, 250 min (~83 calls/mo)
- Growth $189/mo — 500 min, appointments, follow-up, CRM webhook
- Platinum $279/mo — 1,200 min, multi-crew, high volume
- Trial: 14 days or 40 call minutes, whichever comes first; no card; one trial per business number
- 30-day money-back guarantee on paid plans
- Overage $0.29/min

## Who it is for

US trade owners — HVAC, plumbing, electrical, auto repair, and other local service businesses — who lose jobs while they are on a job.

## Contact

support@callgrabbr.com
`
}
