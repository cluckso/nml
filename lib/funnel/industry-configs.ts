import type { FunnelConfig, FunnelStep } from "./funnel-config"
import { getIndustryImage } from "@/lib/marketing-images"
import { buildFunnelTrialStartUrl } from "./funnel-trial-bridge"

const VOLUME_OPTIONS = [
  { value: "under-20", label: "Under 20 calls/week", score: 10 },
  { value: "20-50", label: "20–50 calls/week", score: 25 },
  { value: "50-100", label: "50–100 calls/week", score: 40 },
  { value: "100-plus", label: "100+ calls/week", score: 50 },
]

const PAIN_OPTIONS = [
  { value: "after-hours", label: "After-hours & weekend calls go to voicemail", score: 20 },
  { value: "on-job", label: "Can't answer while on a job or with customers", score: 15 },
  { value: "no-callback", label: "Callers don't leave voicemail — we lose them", score: 25 },
  { value: "slow-followup", label: "Leads slip through before we can call back", score: 15 },
]

const LEAD_SCORING_WEIGHTS: FunnelConfig["leadScoring"] = {
  callVolume: {
    "under-20": 10,
    "20-50": 25,
    "50-100": 40,
    "100-plus": 50,
  },
  biggestPain: {
    "after-hours": 20,
    "on-job": 15,
    "no-callback": 25,
    "slow-followup": 15,
  },
  businessConfirm: {
    yes: 10,
    similar: 5,
  },
}

function buildStandardSteps(displayName: string): FunnelStep[] {
  return [
    {
      id: "confirm",
      title: "Let's confirm your business",
      subtitle: `We tailor CallGrabbr for ${displayName.toLowerCase()} shops like yours.`,
      fields: [
        {
          id: "businessConfirm",
          type: "radio",
          label: `Is your business primarily ${displayName.toLowerCase()}?`,
          required: true,
          options: [
            { value: "yes", label: `Yes — ${displayName}`, score: 10 },
            { value: "similar", label: "Similar home/service business", score: 5 },
          ],
        },
        {
          id: "businessName",
          type: "text",
          label: "Business name",
          placeholder: "Your company name",
          required: true,
        },
      ],
    },
    {
      id: "volume",
      title: "How busy is your phone?",
      subtitle: "This helps us estimate how much revenue you might be leaving on the table.",
      fields: [
        {
          id: "callVolume",
          type: "select",
          label: "Inbound calls per week (estimate)",
          required: true,
          options: VOLUME_OPTIONS,
        },
      ],
    },
    {
      id: "pain",
      title: "What's costing you the most?",
      subtitle: "Pick the challenge that sounds most like your day-to-day.",
      fields: [
        {
          id: "biggestPain",
          type: "radio",
          label: "Biggest missed-call pain point",
          required: true,
          options: PAIN_OPTIONS,
        },
      ],
    },
    {
      id: "contact",
      title: "Get your personalized ROI snapshot",
      subtitle: "We'll show your estimate and how to start a free trial — no credit card required.",
      fields: [
        {
          id: "contactName",
          type: "text",
          label: "Your name",
          placeholder: "First and last name",
          required: true,
        },
        {
          id: "contactEmail",
          type: "email",
          label: "Work email",
          placeholder: "you@yourbusiness.com",
          required: true,
        },
        {
          id: "contactPhone",
          type: "phone",
          label: "Mobile number",
          placeholder: "(555) 123-4567",
          required: true,
        },
      ],
    },
  ]
}

function fromLanding(
  slug: string,
  overrides: Partial<FunnelConfig> &
    Pick<
      FunnelConfig,
      "displayName" | "icon" | "headline" | "subheadline" | "painPoint" | "averageSale" | "missedCallRate"
    >
): FunnelConfig {
  const displayName = overrides.displayName
  return {
    slug,
    displayName,
    icon: overrides.icon,
    headline: overrides.headline,
    subheadline: overrides.subheadline,
    painPoint: overrides.painPoint,
    averageSale: overrides.averageSale,
    missedCallRate: overrides.missedCallRate,
    heroImage: overrides.heroImage ?? getIndustryImage(slug),
    exampleTranscript: overrides.exampleTranscript,
    callSummary: overrides.callSummary,
    testimonial: overrides.testimonial,
    steps: overrides.steps ?? buildStandardSteps(displayName),
    leadScoring: overrides.leadScoring ?? LEAD_SCORING_WEIGHTS,
    cta: overrides.cta ?? { type: "trial", label: "Start free 7-day trial" },
  }
}

/** All funnel configs keyed by slug */
export const FUNNEL_CONFIGS: FunnelConfig[] = [
  fromLanding("hvac", {
    displayName: "HVAC",
    icon: "❄️",
    headline: "Stop Losing HVAC Jobs to Voicemail",
    subheadline:
      "When the AC goes out or the furnace dies, homeowners call the next contractor. Answer every forwarded call 24/7.",
    painPoint: "28% of HVAC calls go unanswered during peak season — each missed emergency can mean $400+ lost.",
    averageSale: 475,
    missedCallRate: 0.28,
    exampleTranscript:
      "Agent: Thanks for calling — how can I help?\nCaller: Our AC stopped working and it's 95 degrees.\nAgent: I'm sorry to hear that. What's the service address?\nCaller: 742 Oak Lane.\nAgent: Got it. Is anyone in the home without cooling right now?",
    callSummary: "AC outage · 742 Oak Lane · High urgency · Callback requested",
    testimonial: {
      quote: "We captured 12 after-hours leads in the first month. One emergency install paid for a year of CallGrabbr.",
      author: "Mike R.",
      role: "HVAC owner, Texas",
    },
  }),
  fromLanding("plumbing", {
    displayName: "Plumbing",
    icon: "🔧",
    headline: "Capture More Plumbing Leads — Even at 2 AM",
    subheadline:
      "Burst pipes and clogged drains can't wait. Your call assistant flags emergencies and texts you the lead instantly.",
    painPoint: "80% of callers won't leave voicemail — they dial your competitor instead.",
    averageSale: 380,
    missedCallRate: 0.35,
    exampleTranscript:
      "Agent: ABC Plumbing, how can I help?\nCaller: Water is leaking under my kitchen sink!\nAgent: Is this active flooding right now?\nCaller: It's dripping pretty bad.\nAgent: What's the address for service?",
    callSummary: "Kitchen leak · Active drip · Address captured · Emergency flag",
    testimonial: {
      quote: "Our after-hours capture rate went from near zero to most calls answered. Game changer for emergency work.",
      author: "Sarah T.",
      role: "Plumbing contractor",
    },
  }),
  fromLanding("electrical", {
    displayName: "Electrical",
    icon: "⚡",
    headline: "Never Miss an Electrical Service Call Again",
    subheadline:
      "Power outages, panel upgrades, and sparking outlets need fast response. Capture every detail for faster quoting.",
    painPoint: "One missed emergency electrical call can cost $400+ in lost revenue.",
    averageSale: 420,
    missedCallRate: 0.3,
    exampleTranscript:
      "Agent: Thanks for calling — what's going on?\nCaller: Half my house lost power and I smell something burning.\nAgent: That sounds urgent. Are you safe to stay in the home?\nCaller: Yes, but I need someone ASAP.",
    callSummary: "Partial outage · Burning smell · Safety check · Urgent callback",
  }),
  fromLanding("auto-repair", {
    displayName: "Auto Repair",
    icon: "🚗",
    headline: "Book More Auto Repair Jobs From Missed Calls",
    subheadline: "Capture year, make, model, and symptoms while your techs are under the hood.",
    painPoint: "Missed calls during shop hours mean lost repair orders every day.",
    averageSale: 550,
    missedCallRate: 0.25,
    exampleTranscript:
      "Agent: Joe's Auto, how can I help?\nCaller: My 2019 Honda won't start — just clicks.\nAgent: Can you tell me the mileage?\nCaller: About 62,000. I'm stranded at a grocery store.",
    callSummary: "2019 Honda · No start · Roadside · Location captured",
  }),
  fromLanding("handyman", {
    displayName: "Handyman",
    icon: "🛠️",
    headline: "Turn Handyman Calls Into Booked Jobs",
    subheadline: "From drywall to deck repairs — capture scope, address, and urgency so you can quote faster.",
    painPoint: "Solo operators miss 3–5 calls per day on average while on a ladder or at a job.",
    averageSale: 320,
    missedCallRate: 0.32,
    exampleTranscript:
      "Agent: How can I help you today?\nCaller: I need someone to fix a fence and patch some drywall.\nAgent: What's the property address?\nCaller: 18 Birch Street.",
    callSummary: "Fence + drywall · 18 Birch St · Quote requested",
  }),
  {
    slug: "roofing",
    displayName: "Roofing",
    icon: "🏠",
    headline: "Stop Losing Roofing Estimates to Voicemail",
    subheadline:
      "Storm damage and leak calls spike when you're on a roof. CallGrabbr captures every inquiry while you're on the job.",
    painPoint: "Storm season means 2× call volume — missed calls during peak demand cost thousands in lost jobs.",
    averageSale: 8500,
    missedCallRate: 0.3,
    heroImage: getIndustryImage("roofing"),
    exampleTranscript:
      "Agent: Thanks for calling — how can I help?\nCaller: We had hail last night and I think our shingles are damaged.\nAgent: What's the property address?\nCaller: 220 Pine Ridge Drive.",
    callSummary: "Hail damage · Inspection requested · Address captured",
    steps: buildStandardSteps("Roofing"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: { type: "trial", label: "Start free 7-day trial" },
    testimonial: {
      quote: "After the last storm we booked 8 inspections from calls we would have missed on the roof.",
      author: "Dan K.",
      role: "Roofing contractor",
    },
  },
  {
    slug: "lawyers",
    displayName: "Law Firm",
    icon: "⚖️",
    headline: "Capture Every Legal Intake Call",
    subheadline: "Potential clients call multiple firms — first response wins. Your assistant collects case basics 24/7.",
    painPoint: "Intake calls during court or client meetings often go unanswered — and legal leads rarely leave voicemail.",
    averageSale: 3500,
    missedCallRate: 0.4,
    heroImage: getIndustryImage("lawyers"),
    exampleTranscript:
      "Agent: Thank you for calling. How may I direct your call?\nCaller: I need to speak with someone about a car accident case.\nAgent: I'm sorry to hear that. Can I get your name and a callback number?",
    callSummary: "PI intake · Car accident · Callback requested",
    steps: buildStandardSteps("Law Firm"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: { type: "trial", label: "Start free 7-day trial" },
  },
  {
    slug: "realtors",
    displayName: "Real Estate",
    icon: "🏡",
    headline: "Never Miss a Buyer or Seller Lead Again",
    subheadline:
      "Showing requests and listing inquiries need instant response. Capture name, timeline, and property interest around the clock.",
    painPoint: "Buyers call 3–4 agents before the first one answers — speed-to-lead wins listings.",
    averageSale: 12000,
    missedCallRate: 0.35,
    heroImage: getIndustryImage("realtors"),
    exampleTranscript:
      "Agent: Thanks for calling — how can I help?\nCaller: I saw the listing on Maple Street and want to schedule a showing.\nAgent: Great — what's the best number to reach you?",
    callSummary: "Showing request · Maple St listing · Buyer lead",
    steps: buildStandardSteps("Real Estate"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: { type: "trial", label: "Start free 7-day trial" },
  },
  {
    slug: "dentists",
    displayName: "Dental Practice",
    icon: "🦷",
    headline: "Fill Your Chair — Capture Every New Patient Call",
    subheadline: "Front desk busy with patients? Your call assistant handles new patient inquiries and appointment requests.",
    painPoint: "New patient calls during procedures often go to voicemail — and patients call the next office on the list.",
    averageSale: 650,
    missedCallRate: 0.28,
    heroImage: getIndustryImage("dentists"),
    exampleTranscript:
      "Agent: Thank you for calling. How can I help?\nCaller: I'm a new patient and need a cleaning appointment.\nAgent: Do you have dental insurance?\nCaller: Yes, Delta Dental.",
    callSummary: "New patient · Cleaning · Delta Dental · Callback requested",
    steps: buildStandardSteps("Dental Practice"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: { type: "trial", label: "Start free 7-day trial" },
  },
  {
    slug: "salons",
    displayName: "Salon",
    icon: "💇",
    headline: "Book More Appointments From Missed Calls",
    subheadline:
      "Stylists can't answer while with clients. Capture booking requests, service type, and preferred times automatically.",
    painPoint: "Walk-in and appointment callers move on fast when nobody picks up — especially on weekends.",
    averageSale: 95,
    missedCallRate: 0.3,
    heroImage: getIndustryImage("salons"),
    exampleTranscript:
      "Agent: Thanks for calling — how can I help?\nCaller: I need a cut and color this Saturday if you have openings.\nAgent: What's your name and the best number to reach you?",
    callSummary: "Cut + color · Saturday request · New booking lead",
    steps: buildStandardSteps("Salon"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: { type: "trial", label: "Start free 7-day trial" },
  },
]

export function getFunnelConfig(slug: string): FunnelConfig | undefined {
  return FUNNEL_CONFIGS.find((c) => c.slug === slug.toLowerCase())
}

export function getAllFunnelSlugs(): string[] {
  return FUNNEL_CONFIGS.map((c) => c.slug)
}

export function getFunnelCalendlyUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_FUNNEL_CALENDLY_URL?.trim() || undefined
}

export function getFunnelCtaHref(config: FunnelConfig): string {
  if (config.cta.type === "calendly") {
    return getFunnelCalendlyUrl() ?? buildFunnelTrialStartUrl(config.slug)
  }
  return buildFunnelTrialStartUrl(config.slug)
}
