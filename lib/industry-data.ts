import { Industry } from "@prisma/client"

export interface IndustryLandingData {
  slug: string
  industry?: Industry
  name: string
  headline: string
  subheadline: string
  /** Scene-first hook shown above the fold on /for/[industry] */
  sceneHook: string
  averageJobValue: number
  painPoints: string[]
  exampleQuestions: string[]
  statMissedCalls: string
  /** Internal SEO links to /guides/* pages */
  relatedGuides?: { label: string; href: string }[]
}

/** Average job value (USD) used for ROI estimates on the dashboard */
export const INDUSTRY_AVERAGE_JOB_VALUE: Record<Industry, number> = {
  [Industry.HVAC]: 475,
  [Industry.PLUMBING]: 380,
  [Industry.ELECTRICIAN]: 420,
  [Industry.AUTO_REPAIR]: 550,
  [Industry.HANDYMAN]: 320,
  [Industry.CHILDCARE]: 280,
  [Industry.GENERIC]: 400,
}

export function getAverageJobValue(industry: Industry): number {
  return INDUSTRY_AVERAGE_JOB_VALUE[industry] ?? 400
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculatePotentialRevenue(leadCount: number, industry: Industry): number {
  return leadCount * getAverageJobValue(industry)
}

const LANDING_PAGES: IndustryLandingData[] = [
  {
    slug: "hvac",
    industry: Industry.HVAC,
    name: "HVAC",
    headline: "Stop Losing HVAC Jobs to Missed Calls",
    subheadline:
      "When the AC goes out or the furnace dies, homeowners call the next contractor. CallGrabbr answers when you can't and texts you the job details in seconds.",
    sceneHook:
      "It's 97° and you're under a house finishing a changeout. Your phone buzzes in the truck. By the time you call back, they already booked the next HVAC company on the list.",
    averageJobValue: 475,
    painPoints: [
      "No-heat and no-AC calls spike after hours and on weekends",
      "Technicians miss calls while on a job site",
      "Emergency calls need fast intake — address, system type, urgency",
    ],
    exampleQuestions: [
      "What's the issue — no cooling, no heat, or something else?",
      "What's the service address?",
      "Is anyone in the home without heat or AC right now?",
    ],
    statMissedCalls: "28% of HVAC calls go unanswered during peak season",
    relatedGuides: [
      { label: "Best AI answering for HVAC (2026)", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "After-hours answering cost for contractors", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "CallGrabbr vs Smith.ai", href: "/guides/callgrabbr-vs-smith-ai" },
    ],
  },
  {
    slug: "plumbing",
    industry: Industry.PLUMBING,
    name: "Plumbing",
    headline: "Capture More Plumbing Leads — Even at 2 AM",
    subheadline:
      "Burst pipes and clogged drains can't wait. Your call assistant answers instantly, flags emergencies, and texts you the lead before the caller dials your competitor.",
    sceneHook:
      "It's 2 AM. A homeowner has water running under the sink. They call you, hang up when you don't answer, and dial the next plumber — while you're asleep.",
    averageJobValue: 380,
    painPoints: [
      "Emergency leaks need immediate callback info",
      "Plumbers on a job can't answer the phone",
      "After-hours calls are your highest-value jobs",
    ],
    exampleQuestions: [
      "Is this an emergency like a leak or flooding?",
      "What's the address for service?",
      "Can you describe what's going on?",
    ],
    statMissedCalls: "Most emergency callers hang up — and dial the next plumber",
    relatedGuides: [
      { label: "After-hours answering cost for contractors", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "CallGrabbr vs Smith.ai", href: "/guides/callgrabbr-vs-smith-ai" },
      { label: "Best AI answering for HVAC (2026)", href: "/guides/best-ai-answering-for-hvac-2026" },
    ],
  },
  {
    slug: "electrical",
    industry: Industry.ELECTRICIAN,
    name: "Electrical",
    headline: "Never Miss an Electrical Service Call Again",
    subheadline:
      "Power outages, panel upgrades, and sparking outlets need fast response. CallGrabbr captures every detail so you can quote and schedule faster.",
    sceneHook:
      "You're in an attic pulling wire. A panicked homeowner calls about sparks. They don't leave a message — they call the next electrician who picks up.",
    averageJobValue: 420,
    painPoints: [
      "Safety issues need urgent flagging",
      "Electricians lose leads while on ladders and in attics",
      "Commercial and residential calls need different intake",
    ],
    exampleQuestions: [
      "Is there a safety concern like sparks or burning smell?",
      "Residential or commercial property?",
      "What's the best callback number?",
    ],
    statMissedCalls: "One missed emergency walks — callers dial the next electrician",
  },
  {
    slug: "auto-repair",
    industry: Industry.AUTO_REPAIR,
    name: "Auto Repair",
    headline: "Book More Auto Repair Jobs From Missed Calls",
    subheadline:
      "Capture year, make, model, and symptoms when callers share them. CallGrabbr handles intake while your techs are under the hood.",
    sceneHook:
      "Your techs are under the hood and the shop phone won't stop. Every unanswered ring is an RO that went to the shop down the street.",
    averageJobValue: 550,
    painPoints: [
      "Shop phones ring nonstop during business hours",
      "Vehicle details are easy to miss when you're busy",
      "Roadside and tow requests need location capture",
    ],
    exampleQuestions: [
      "What's the year, make, and model?",
      "What's the vehicle doing — or not doing?",
      "Do you need towing or can you drive it in?",
    ],
    statMissedCalls: "Missed calls during shop hours = lost ROs",
  },
  {
    slug: "handyman",
    industry: Industry.HANDYMAN,
    name: "Handyman",
    headline: "Turn Handyman Calls Into Booked Jobs",
    subheadline:
      "From drywall to deck repairs, callers want fast answers. Your call assistant captures the scope, address, and urgency so you can follow up with a quote.",
    sceneHook:
      "You're on a ladder with both hands full. The phone rings in your pocket. By lunch you've missed three quotes you never knew about.",
    averageJobValue: 320,
    painPoints: [
      "Solo operators can't answer while on a ladder",
      "Callers describe vague jobs — you need details upfront",
      "Weekend inquiries often go unanswered",
    ],
    exampleQuestions: [
      "What type of repair or project do you need?",
      "What's the property address?",
      "When were you hoping to get this done?",
    ],
    statMissedCalls: "Solo operators miss 3–5 calls per day on average",
  },
  {
    slug: "childcare",
    industry: Industry.CHILDCARE,
    name: "Childcare",
    headline: "Answer Parent Inquiries — Even During Drop-Off",
    subheadline:
      "Tour requests and enrollment calls need a warm, professional first impression. CallGrabbr captures parent info and schedules tours while you focus on the kids.",
    sceneHook:
      "Drop-off is chaos. A parent calling about a tour gets voicemail — and tries the next center on their list before you can call back.",
    averageJobValue: 280,
    painPoints: [
      "Staff are with children and can't answer phones",
      "Tour scheduling needs availability capture",
      "Parents call multiple centers — first response wins",
    ],
    exampleQuestions: [
      "What age group are you looking for?",
      "Would you like to schedule a tour?",
      "What's the best number to reach you?",
    ],
    statMissedCalls: "Parents call 3–4 centers before enrolling",
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    headline: "Book More Cleaning Clients From Missed Calls",
    subheadline:
      "Residential and commercial cleaning leads need fast follow-up. Capture square footage, frequency, and address when callers provide them.",
    sceneHook:
      "Your crew is mid-clean. A commercial lead calls for a quote. Speed-to-lead wins the recurring contract — voicemail usually loses it.",
    averageJobValue: 250,
    painPoints: [
      "Crews are on-site and can't answer",
      "Quote requests need property details upfront",
      "Recurring service inquiries need scheduling info",
    ],
    exampleQuestions: [
      "Residential or commercial cleaning?",
      "How often do you need service?",
      "What's the property address?",
    ],
    statMissedCalls: "Speed-to-lead wins recurring contracts",
  },
  {
    slug: "landscaping",
    name: "Landscaping",
    headline: "Grow Your Landscaping Business — Capture More Leads",
    subheadline:
      "Seasonal demand spikes mean missed calls = missed revenue. CallGrabbr answers while your crew is on a job site.",
    sceneHook:
      "Spring rush. Your crew is on a mow route. Estimate calls stack up — and the shops that answer first book the season.",
    averageJobValue: 350,
    painPoints: [
      "Peak season call volume overwhelms small teams",
      "Estimate requests need address and scope",
      "Mowing vs. install jobs need different intake",
    ],
    exampleQuestions: [
      "What service do you need — mowing, landscaping, or hardscape?",
      "What's the property address?",
      "Are you looking for a one-time or recurring service?",
    ],
    statMissedCalls: "Spring rush means more missed calls than any other season",
  },
]

export const INDUSTRY_LANDING_PAGES = LANDING_PAGES

export function getIndustryLandingBySlug(slug: string): IndustryLandingData | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug.toLowerCase())
}

export function getAllIndustrySlugs(): string[] {
  return LANDING_PAGES.map((p) => p.slug)
}

export const HOMEPAGE_INDUSTRY_LINKS: { name: string; slug: string }[] = [
  { name: "HVAC", slug: "hvac" },
  { name: "Plumbing", slug: "plumbing" },
  { name: "Electrical", slug: "electrical" },
  { name: "Auto repair", slug: "auto-repair" },
  { name: "Handyman", slug: "handyman" },
  { name: "Cleaning", slug: "cleaning" },
  { name: "Landscaping", slug: "landscaping" },
]
