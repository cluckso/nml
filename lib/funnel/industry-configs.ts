import type { FunnelConfig, FunnelStep } from "./funnel-config"
import { getIndustryImage } from "@/lib/marketing-images"
import { buildFunnelTrialStartUrl } from "./funnel-trial-bridge"
import { defaultFunnelTrialCta } from "@/lib/trial-marketing"
import { funnelSubscribeUrl } from "@/lib/monetization-urls"

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
    smsPreview: overrides.smsPreview,
    testimonial: overrides.testimonial,
    steps: overrides.steps ?? buildStandardSteps(displayName),
    leadScoring: overrides.leadScoring ?? LEAD_SCORING_WEIGHTS,
    cta: overrides.cta ?? defaultFunnelTrialCta(),
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
      "Agent: Thanks for calling — how can I help?\nCaller: Our AC stopped working and it's 95 degrees.\nAgent: I'm sorry to hear that. What's the service address?\nCaller: 742 Oak Lane.\nAgent: Got it. Is anyone in the home without cooling right now?\nCaller: Yes, the whole house is hot.\nAgent: Can I get your name and callback number?\nCaller: Lisa Torres, (555) 234-5678.",
    callSummary: "AC outage · 742 Oak Lane · High urgency · Callback requested",
    smsPreview: {
      name: "Lisa Torres",
      phone: "(555) 234-5678",
      address: "742 Oak Lane",
      job: "AC outage - no cooling",
      urgency: "High",
    },
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
      "Agent: ABC Plumbing, how can I help?\nCaller: Water is leaking under my kitchen sink!\nAgent: Is this active flooding right now?\nCaller: It's dripping pretty bad.\nAgent: What's the address for service?\nCaller: 42 Maple St.\nAgent: Can I get your name and number?\nCaller: John Martinez, (555) 234-5678.",
    callSummary: "Kitchen leak · 42 Maple St · Active drip · Emergency flag",
    smsPreview: {
      name: "John Martinez",
      phone: "(555) 234-5678",
      address: "42 Maple St",
      job: "Kitchen sink leak",
      urgency: "High",
    },
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
    painPoint: "Emergency callers hang up fast — and dial the next electrician who answers.",
    averageSale: 420,
    missedCallRate: 0.3,
    exampleTranscript:
      "Agent: Thanks for calling — what's going on?\nCaller: Half my house lost power and I smell something burning.\nAgent: That sounds urgent. Are you safe to stay in the home?\nCaller: Yes, but I need someone ASAP.\nAgent: What's the service address?\nCaller: 88 Cedar Court.\nAgent: Name and callback number?\nCaller: David Kim, (555) 891-2244.",
    callSummary: "Partial outage · 88 Cedar Court · Burning smell · Urgent callback",
    smsPreview: {
      name: "David Kim",
      phone: "(555) 891-2244",
      address: "88 Cedar Court",
      job: "Partial outage - burning smell",
      urgency: "High",
    },
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
      "Agent: Joe's Auto, how can I help?\nCaller: My 2019 Honda won't start — just clicks.\nAgent: Can you tell me the mileage?\nCaller: About 62,000. I'm stranded at a grocery store.\nAgent: What's your name and callback number?\nCaller: Maria Gonzalez, (555) 442-1190.",
    callSummary: "2019 Honda · No start · Grocery store · Roadside",
    smsPreview: {
      name: "Maria Gonzalez",
      phone: "(555) 442-1190",
      address: "Grocery store",
      job: "2019 Honda - won't start (clicks)",
      urgency: "Medium",
    },
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
      "Agent: How can I help you today?\nCaller: I need someone to fix a fence and patch some drywall.\nAgent: What's the property address?\nCaller: 18 Birch Street.\nAgent: Name and number for a callback?\nCaller: Tom Reed, (555) 330-8871.",
    callSummary: "Fence + drywall · 18 Birch St · Quote requested",
    smsPreview: {
      name: "Tom Reed",
      phone: "(555) 330-8871",
      address: "18 Birch St",
      job: "Fence + drywall",
      urgency: "Medium",
    },
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
      "Agent: Thanks for calling — how can I help?\nCaller: We had hail last night and I think our shingles are damaged.\nAgent: What's the property address?\nCaller: 220 Pine Ridge Drive.\nAgent: Name and callback number?\nCaller: Jennifer Walsh, (555) 612-4400.",
    callSummary: "Hail damage · 220 Pine Ridge Dr · Inspection requested",
    smsPreview: {
      name: "Jennifer Walsh",
      phone: "(555) 612-4400",
      address: "220 Pine Ridge Dr",
      job: "Hail damage - shingle inspection",
      urgency: "High",
    },
    steps: buildStandardSteps("Roofing"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: defaultFunnelTrialCta(),
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
      "Agent: Thank you for calling. How may I direct your call?\nCaller: I need to speak with someone about a car accident case.\nAgent: I'm sorry to hear that. Can I get your name and a callback number?\nCaller: James Mitchell, (555) 778-3301.",
    callSummary: "PI intake · Car accident · Callback requested",
    smsPreview: {
      name: "James Mitchell",
      phone: "(555) 778-3301",
      address: "Callback requested",
      job: "Car accident - PI intake",
      urgency: "High",
    },
    steps: buildStandardSteps("Law Firm"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: defaultFunnelTrialCta(),
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
      "Agent: Thanks for calling — how can I help?\nCaller: I saw the listing on Maple Street and want to schedule a showing.\nAgent: Great — what's the best number to reach you?\nCaller: Amanda Lee, (555) 201-8899.",
    callSummary: "Showing request · Maple St listing · Buyer lead",
    smsPreview: {
      name: "Amanda Lee",
      phone: "(555) 201-8899",
      address: "Maple St listing",
      job: "Buyer - showing request",
      urgency: "Medium",
    },
    steps: buildStandardSteps("Real Estate"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: defaultFunnelTrialCta(),
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
      "Agent: Thank you for calling. How can I help?\nCaller: I'm a new patient and need a cleaning appointment.\nAgent: Do you have dental insurance?\nCaller: Yes, Delta Dental.\nAgent: Name and callback number?\nCaller: Chris Nguyen, (555) 445-7722.",
    callSummary: "New patient · Cleaning · Delta Dental · Callback requested",
    smsPreview: {
      name: "Chris Nguyen",
      phone: "(555) 445-7722",
      address: "New patient",
      job: "Cleaning appointment - Delta Dental",
      urgency: "Low",
    },
    steps: buildStandardSteps("Dental Practice"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: defaultFunnelTrialCta(),
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
      "Agent: Thanks for calling — how can I help?\nCaller: I need a cut and color this Saturday if you have openings.\nAgent: What's your name and the best number to reach you?\nCaller: Taylor Brooks, (555) 998-1144.",
    callSummary: "Cut + color · Saturday request · New booking lead",
    smsPreview: {
      name: "Taylor Brooks",
      phone: "(555) 998-1144",
      address: "Saturday request",
      job: "Cut + color - Saturday",
      urgency: "Medium",
    },
    steps: buildStandardSteps("Salon"),
    leadScoring: LEAD_SCORING_WEIGHTS,
    cta: defaultFunnelTrialCta(),
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
  if (config.cta.type === "subscribe") {
    return funnelSubscribeUrl(config.slug)
  }
  return buildFunnelTrialStartUrl(config.slug)
}
