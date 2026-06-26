import { Industry } from "@prisma/client"

export interface IndustryLandingData {
  slug: string
  industry?: Industry
  name: string
  headline: string
  subheadline: string
  averageJobValue: number
  painPoints: string[]
  exampleQuestions: string[]
  statMissedCalls: string
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
    headline: "Stop Losing HVAC Jobs to Voicemail",
    subheadline:
      "When the AC goes out or the furnace dies, homeowners call the next contractor. CallGrabbr answers every call 24/7 and captures the job details before they hang up.",
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
  },
  {
    slug: "plumbing",
    industry: Industry.PLUMBING,
    name: "Plumbing",
    headline: "Capture Every Plumbing Lead — Even at 2 AM",
    subheadline:
      "Burst pipes and clogged drains can't wait. Your AI receptionist answers instantly, flags emergencies, and texts you the lead before the caller dials your competitor.",
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
    statMissedCalls: "80% of callers won't leave voicemail",
  },
  {
    slug: "electrical",
    industry: Industry.ELECTRICIAN,
    name: "Electrical",
    headline: "Never Miss an Electrical Service Call Again",
    subheadline:
      "Power outages, panel upgrades, and sparking outlets need fast response. CallGrabbr captures every detail so you can quote and schedule faster.",
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
    statMissedCalls: "One missed emergency call can cost $400+",
  },
  {
    slug: "auto-repair",
    industry: Industry.AUTO_REPAIR,
    name: "Auto Repair",
    headline: "Book More Auto Repair Jobs From Every Call",
    subheadline:
      "Capture year, make, model, and symptoms on every call. CallGrabbr handles intake while your techs are under the hood.",
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
    headline: "Turn Every Handyman Call Into a Booked Job",
    subheadline:
      "From drywall to deck repairs, callers want fast answers. Your AI receptionist captures the scope, address, and urgency so you can follow up with a quote.",
    averageJobValue: 320,
    painPoints: [
      "Solo operators can't answer while on a ladder",
      "Callers describe vague jobs — you need details upfront",
      "Weekend inquiries often go to voicemail",
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
    headline: "Answer Every Parent Inquiry — Even During Drop-Off",
    subheadline:
      "Tour requests and enrollment calls need a warm, professional first impression. CallGrabbr captures parent info and schedules tours while you focus on the kids.",
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
    headline: "Book More Cleaning Clients From Every Call",
    subheadline:
      "Residential and commercial cleaning leads need fast follow-up. Capture square footage, frequency, and address on every call automatically.",
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
    headline: "Grow Your Landscaping Business — Capture Every Lead",
    subheadline:
      "Seasonal demand spikes mean missed calls = missed revenue. CallGrabbr answers while your crew is on a job site.",
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
  { name: "Home services", slug: "hvac" },
]
