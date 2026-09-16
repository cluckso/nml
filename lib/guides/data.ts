import {
  formatJobValuePromptLine,
  HUMAN_RECEPTIONIST_FROM_MONTHLY,
  PRICING_TIERS_BY_KEY,
} from "@/lib/pricing-catalog"
import { PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
import {
  BASIC_FRAME,
  CATEGORY_NAME,
  PRODUCT_ONE_LINER,
  ROSIE_PRICE_OBJECTION,
} from "@/lib/marketing/positioning"
import { trialDaysLabel, trialSummaryShort } from "@/lib/trial-marketing"
import type { Guide } from "./types"

const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
const growth = PRICING_TIERS_BY_KEY[PLAN_GROWTH]
const platinum = PRICING_TIERS_BY_KEY[PLAN_PLATINUM]

const TRIAL_SIGNUP = "/sign-up?next=%2Ftrial%2Fstart"

export const GUIDE_TRIAL_HREF = TRIAL_SIGNUP

const GUIDES: Guide[] = [
  {
    slug: "callgrabbr-vs-ruby",
    title: "CallGrabbr vs Ruby: Missed-Call Lead Capture vs Live Receptionist",
    description: `Compare CallGrabbr and Ruby for HVAC, plumbing, and trade shops. ${CATEGORY_NAME}, lead capture, after-hours coverage, and when a live receptionist is worth $${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo.`,
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Ruby",
    intro:
      "Ruby is a well-known live receptionist service. CallGrabbr is missed-call lead capture for contractors — we grab job-ready leads when you miss a ring, without paying full receptionist rates. Here's how they differ for local service businesses.",
    sections: [
      {
        heading: "Who each option is for",
        paragraphs: [
          "Ruby fits businesses that want a human voice on every call and can budget for live receptionist pricing — often starting around $235/month and climbing with volume.",
          `CallGrabbr fits one-truck and growing trade shops that lose revenue when the phone rings during a service call or after hours. ${PLAN_BASIC} (${BASIC_FRAME}) covers missed and after-hours capture; ${PLAN_GROWTH} and ${PLAN_PLATINUM} when you want more inbound handled like a front desk.`,
        ],
      },
      {
        heading: "Pricing snapshot",
        paragraphs: [
          `Ruby-style live receptionist services typically start near $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/month and rise with minutes and features.`,
          `CallGrabbr: ${PLAN_BASIC} $${basic.price}/mo · ${PLAN_GROWTH} $${growth.price}/mo · ${PLAN_PLATINUM} $${platinum.price}/mo. ${trialSummaryShort()}. ${formatJobValuePromptLine()} Capture one job you'd have lost and the plan often pays for itself for months.`,
        ],
      },
      {
        heading: "Lead capture for trades",
        paragraphs: [
          "Contractors need more than a message: name, callback number, address, urgency, and what broke. CallGrabbr is tuned for service intake and texts or emails you the lead summary in seconds.",
          "Ruby can take detailed messages with trained agents. You're paying for human judgment and conversation quality — valuable if brand voice and complex phone trees matter more than cost per captured job.",
        ],
        bullets: [
          "CallGrabbr: trade intake for HVAC, plumbing, and other local services; instant SMS/email lead alerts",
          "Ruby: live agents; stronger when you need a human on every ring",
          "Both: can cover after hours when you configure forwarding",
        ],
      },
      {
        heading: "When to choose CallGrabbr",
        paragraphs: [
          "Choose CallGrabbr if your main problem is missed jobs while you're on a ladder, under a sink, or closed for the night — and one recovered emergency call covers months of software.",
          "Stick with (or add) a live service like Ruby if you need complex live transfers, white-glove scripting across many departments, or a human receptionist as a brand requirement.",
        ],
      },
    ],
    comparison: {
      competitorName: "Ruby",
      rows: [
        { label: "Starting price (typical)", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: `~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo` },
        { label: "Category", callgrabbr: CATEGORY_NAME, competitor: "Live receptionist service" },
        { label: "Built for trades intake", callgrabbr: "Yes — service, address, urgency", competitor: "Message-taking (configurable)" },
        { label: "Lead alerts", callgrabbr: "SMS & email in seconds", competitor: "Depends on plan / setup" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is CallGrabbr cheaper than Ruby?",
        answer: `Usually yes for contractor shops. CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo for missed and after-hours capture. Live receptionist services like Ruby often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo and scale with usage.`,
      },
      {
        question: "Can CallGrabbr replace a live receptionist?",
        answer:
          "For many HVAC and plumbing shops, yes — if your goal is capturing job details when you can't pick up. If you need a human on every call for brand or complex transfers, a live receptionist service may still fit better (or alongside lead capture for overflow).",
      },
      {
        question: "Does CallGrabbr work after hours?",
        answer:
          "Yes. Forward your business line (or after-hours only) and CallGrabbr picks up missed rings, captures the lead, and texts or emails you so you can call back first.",
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Smith.ai", href: "/guides/callgrabbr-vs-smith-ai" },
      { label: "After-hours lead capture cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "After-hours lead capture for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Missed-call lead capture vs AI answering", href: "/guides/missed-call-lead-capture-vs-ai-answering" },
      { label: "HVAC landing page", href: "/for/hvac" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: ["CallGrabbr vs Ruby", "Ruby receptionist alternative", "missed call lead capture contractors", "HVAC missed call capture"],
  },
  {
    slug: "callgrabbr-vs-smith-ai",
    title: "CallGrabbr vs Smith.ai: Missed-Call Lead Capture for Service Businesses",
    description:
      "Compare CallGrabbr and Smith.ai for contractors. Hybrid receptionist pricing (~$95–$300+), trade-focused lead capture, and when missed-call lead capture beats a generalist receptionist platform.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Smith.ai",
    intro:
      "Smith.ai is a broad receptionist platform (AI plus optional live agents). CallGrabbr is missed-call lead capture for local service businesses — especially HVAC and plumbing — with clear trade pricing and job-ready lead alerts. Use this guide to pick the right fit.",
    sections: [
      {
        heading: "Positioning difference",
        paragraphs: [
          "Smith.ai is a broad receptionist platform (AI plus optional live agents). Public hybrid pricing often lands roughly in the $95–$300+/month range depending on minutes and human backup.",
          `CallGrabbr is narrower on purpose: stop losing contractor jobs to missed and after-hours calls. ${PLAN_BASIC} covers the rings you miss; ${PLAN_GROWTH} and ${PLAN_PLATINUM} step up when you want more of the line handled around the clock.`,
        ],
      },
      {
        heading: "Pricing & packaging",
        paragraphs: [
          `CallGrabbr: ${PLAN_BASIC} $${basic.price}/mo · ${PLAN_GROWTH} $${growth.price}/mo · ${PLAN_PLATINUM} $${platinum.price}/mo. ${trialSummaryShort()}.`,
          "Smith.ai packages vary by AI-only vs hybrid live support. If you need frequent live handoff and multi-industry scripting, their hybrid tier can make sense. If you mainly need trade intake and a text when a lead comes in, CallGrabbr keeps cost and setup simpler.",
        ],
      },
      {
        heading: "Intake quality for home services",
        paragraphs: [
          "Homeowners calling about no heat, a leak, or a breaker trip expect fast questions: what's wrong, where, how urgent. CallGrabbr's industry flows are built around that.",
          "Smith.ai can be configured for many verticals. Expect more setup if you want the same depth of trade-specific intake out of the box.",
        ],
        bullets: [
          "CallGrabbr: SMS/email lead summaries tuned for service jobs",
          "Smith.ai: AI + optional live agents; strong if you need hybrid receptionist coverage",
          "Both: work with call forwarding for after-hours",
        ],
      },
      {
        heading: "Bottom line",
        paragraphs: [
          "Pick CallGrabbr when you're a contractor optimizing for cost per captured job and speed-to-lead after missed rings.",
          "Pick Smith.ai (or a hybrid) when you want a generalist receptionist stack with live backup as a core product feature — and you're ready for that pricing band.",
        ],
      },
    ],
    comparison: {
      competitorName: "Smith.ai",
      rows: [
        { label: "Typical monthly range", callgrabbr: `$${basic.price}–$${platinum.price}`, competitor: "~$95–$300+" },
        { label: "Category", callgrabbr: CATEGORY_NAME, competitor: "Broad SMB receptionist platform" },
        { label: "Live agents", callgrabbr: "Lead capture first", competitor: "AI + hybrid live options" },
        { label: "Lead delivery", callgrabbr: "Instant SMS & email", competitor: "Varies by plan" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is CallGrabbr the same as Smith.ai?",
        answer:
          "No. Smith.ai is a general AI/hybrid receptionist platform. CallGrabbr is missed-call lead capture built specifically for contractors who need missed and after-hours calls turned into job-ready leads with trade-style intake.",
      },
      {
        question: "Why would a plumber choose CallGrabbr over Smith.ai?",
        answer: `If the job is capturing emergency and after-hours leads without hybrid receptionist pricing, CallGrabbr ${PLAN_BASIC} at $${basic.price}/mo is a simpler fit. Smith.ai may win if you want live agent backup as a primary feature.`,
      },
      {
        question: "Can I try CallGrabbr before switching?",
        answer: `Yes. Start a ${trialDaysLabel()} free trial with no card required, forward your line, and test with real calls.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "After-hours lead capture cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "Missed-call lead capture vs AI answering", href: "/guides/missed-call-lead-capture-vs-ai-answering" },
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: ["CallGrabbr vs Smith.ai", "Smith.ai alternative", "missed call lead capture contractors", "plumber missed call capture"],
  },
  {
    slug: "best-ai-answering-for-hvac-2026",
    title: "After-Hours & Missed-Call Lead Capture for HVAC (2026)",
    description:
      "What HVAC owners should look for in after-hours and missed-call lead capture in 2026: emergency intake, pricing, and how CallGrabbr compares for no-heat and no-AC calls.",
    eyebrow: "HVAC buyer guide · 2026",
    headline: "After-hours & missed-call lead capture for HVAC (2026)",
    intro:
      "Peak season and after-hours no-heat / no-AC calls don't wait. The best missed-call lead capture setup for HVAC shops grabs address, system issue, and urgency — then texts you so you call back before the homeowner dials the next contractor.",
    sections: [
      {
        heading: "What “best” means for HVAC in 2026",
        paragraphs: [
          "Skip vanity features. For HVAC, best means: picks up when techs can't, asks the right questions, flags emergencies, and delivers a lead you can act on in seconds.",
          "Budget receptionist tools that only leave a name and number still lose jobs. Live receptionist plans at $235+/mo work, but many shops don't need a human on every ring — they need the emergency job details.",
        ],
        bullets: [
          "After-hours and weekend coverage via call forwarding",
          "Intake: cooling vs heat, address, occupancy / urgency",
          "Instant SMS or email with the lead summary",
          "Clear monthly price tied to how you use the phone (missed-only vs most inbound)",
        ],
      },
      {
        heading: "How CallGrabbr fits HVAC",
        paragraphs: [
          `CallGrabbr picks up when you forward the line, collects HVAC-relevant details, and alerts you immediately. ${PLAN_BASIC} ($${basic.price}/mo) covers missed and after-hours. ${PLAN_GROWTH} ($${growth.price}/mo) is for shops that want most inbound handled like a 24/7 desk. ${PLAN_PLATINUM} ($${platinum.price}/mo) fits multi-crew volume.`,
          `${formatJobValuePromptLine()} One recovered HVAC emergency often covers months of lead capture.`,
        ],
      },
      {
        heading: "How to evaluate any lead capture vendor",
        paragraphs: [
          "Run a live test: call after hours, describe a furnace that won't start, and check whether the summary includes address and urgency. Time-to-text matters more than a polished homepage.",
          "Compare total monthly cost at your real volume — not just the entry price. Entry receptionist tools near $49/mo exist; human services start much higher. CallGrabbr sits in the middle with trade-specific intake.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          `Start a ${trialDaysLabel()} trial, forward your business line (or after-hours only), and place a test call. If the lead text looks like a job ticket, you're close to the right setup.`,
        ],
      },
    ],
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "What is the best missed-call lead capture for HVAC companies?",
        answer: `Look for after-hours coverage, HVAC-style intake (issue, address, urgency), and instant lead alerts. CallGrabbr is built for that workflow, with ${PLAN_BASIC} from $${basic.price}/mo and a ${trialDaysLabel()} free trial.`,
      },
      {
        question: "Should HVAC companies use lead capture or a live receptionist?",
        answer: `If you mainly lose jobs on missed and after-hours rings, missed-call lead capture is usually enough and far cheaper than live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo. Choose live or hybrid receptionist software if you need a human on every call.`,
      },
      {
        question: "Does CallGrabbr handle emergency no-heat calls?",
        answer:
          "Yes. CallGrabbr collects urgency and service details so you know which callbacks to prioritize when you get the text or email summary.",
      },
    ],
    relatedLinks: [
      { label: "HVAC landing page", href: "/for/hvac" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "After-hours lead capture cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "Missed-call lead capture vs AI answering", href: "/guides/missed-call-lead-capture-vs-ai-answering" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "HVAC missed call lead capture",
      "after hours HVAC lead capture 2026",
      "HVAC voicemail alternative",
      "after hours HVAC phone answering",
    ],
  },
  {
    slug: "after-hours-answering-cost-for-contractors",
    title: "After-Hours Lead Capture Cost for Contractors (2026)",
    description: `What contractors actually pay for after-hours lead capture: live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo, hybrid receptionist ~$95–$300+, and CallGrabbr from $${basic.price}/mo — plus the cost of one missed emergency job.`,
    eyebrow: "Cost guide",
    headline: "After-hours lead capture cost for contractors",
    intro:
      "After-hours calls are often your highest-value jobs — and the ones that go to whoever picks up first. Here's what after-hours lead capture typically costs in 2026, and how to think about ROI.",
    sections: [
      {
        heading: "What shops usually pay",
        paragraphs: [
          `Live receptionist services (e.g. Ruby-style) often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/month and climb with minutes.`,
          "Hybrid AI + live receptionist platforms (e.g. Smith.ai-style) commonly land roughly $95–$300+/month depending on human backup and volume.",
          `Entry receptionist tools may advertise near $49/mo. CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo for missed and after-hours capture — with ${PLAN_GROWTH} at $${growth.price}/mo and ${PLAN_PLATINUM} at $${platinum.price}/mo when you need more coverage.`,
        ],
      },
      {
        heading: "The real cost: missed emergencies",
        paragraphs: [
          `${formatJobValuePromptLine()} For HVAC, plumbing, and similar trades, that one after-hours job can cover months of CallGrabbr.`,
          "Voicemail is free until it isn't — most emergency callers hang up and dial the next number on the list.",
        ],
      },
      {
        heading: "How to size the right plan",
        paragraphs: [
          `${PLAN_BASIC}: you're on jobs all day and mainly need evenings, weekends, and the rings you miss.`,
          `${PLAN_GROWTH}: you want most inbound handled so the shop phone never goes to voicemail during busy hours.`,
          `${PLAN_PLATINUM}: multi-crew or high volume where dropped calls are expensive every day.`,
        ],
        bullets: [
          `CallGrabbr ${PLAN_BASIC}: $${basic.price}/mo`,
          `CallGrabbr ${PLAN_GROWTH}: $${growth.price}/mo`,
          `CallGrabbr ${PLAN_PLATINUM}: $${platinum.price}/mo`,
          `${trialSummaryShort()}`,
        ],
      },
      {
        heading: "DIY vs lead capture",
        paragraphs: [
          "Forwarding to a personal cell after hours is free but burns your evenings and still drops calls when you're unavailable. A lead capture layer exists so the caller gets intake instead of a busy signal or voicemail.",
        ],
      },
    ],
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "How much does after-hours lead capture cost for contractors?",
        answer: `Expect ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo for live receptionists, roughly $95–$300+ for many hybrid receptionist plans, and from $${basic.price}/mo for CallGrabbr ${PLAN_BASIC} missed and after-hours coverage.`,
      },
      {
        question: "Is after-hours lead capture worth it?",
        answer: `Usually yes if you take emergency work. ${formatJobValuePromptLine()} One missed job often exceeds several months of lead capture software.`,
      },
      {
        question: "Can I only forward after hours?",
        answer:
          "Yes. Most carriers let you forward only when unanswered or on a schedule. Forward after hours to CallGrabbr and keep daytime rings on your phone if you prefer.",
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "CallGrabbr vs Smith.ai", href: "/guides/callgrabbr-vs-smith-ai" },
      { label: "After-hours lead capture for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Missed-call lead capture vs AI answering", href: "/guides/missed-call-lead-capture-vs-ai-answering" },
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "after hours lead capture cost",
      "contractor missed call capture price",
      "after hours phone answering HVAC",
      "plumber after hours lead capture",
    ],
  },
  {
    slug: "callgrabbr-vs-rosie",
    title: "CallGrabbr vs Rosie: Missed-Call Lead Capture for Contractors",
    description:
      "Compare CallGrabbr and Rosie for HVAC and plumbing shops. Trade intake, missed-call capture, pricing, and when each tool fits.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Rosie",
    intro:
      "You're under a truck or on a roof when the phone rings. Rosie and CallGrabbr both aim to catch that call — but they're built for slightly different shops. Here's how to choose between receptionist software and trade-focused lead capture.",
    sections: [
      {
        heading: "The scene both products solve",
        paragraphs: [
          "A homeowner with no AC or a burst pipe will not wait on voicemail. They dial the next number. Any tool that picks up and captures the job details beats silence.",
          "The difference is how deep the trade intake goes, how leads get to you, and whether the pricing matches a one-truck shop or a growing crew.",
        ],
      },
      {
        heading: "Where CallGrabbr focuses",
        paragraphs: [
          `CallGrabbr is ${CATEGORY_NAME} for local service businesses — HVAC, plumbing, electrical, auto, and similar trades. ${PLAN_BASIC} covers the rings you miss; ${PLAN_GROWTH} and ${PLAN_PLATINUM} step up when you want most inbound handled like a front desk.`,
          `${formatJobValuePromptLine()} Capture one you'd have lost and the plan often pays for itself for months.`,
        ],
        bullets: [
          "Trade-style intake: issue, address, urgency",
          "Lead alerts by SMS and email in seconds",
          `${trialSummaryShort()}`,
          `Clear tiers: ${PLAN_BASIC} $${basic.price}/mo · ${PLAN_GROWTH} $${growth.price}/mo · ${PLAN_PLATINUM} $${platinum.price}/mo`,
        ],
      },
      {
        heading: "How to evaluate Rosie (or any peer receptionist tool)",
        paragraphs: [
          ROSIE_PRICE_OBJECTION,
          "Run the same mystery shop on both: forward a test line, call as a panicked homeowner, and check whether the summary includes address and urgency — not just a name and number.",
          "Compare monthly cost at your real volume, after-hours coverage, and how fast the lead hits your phone. Prefer the tool that feels like a job ticket, not a generic voicemail transcript.",
        ],
      },
      {
        heading: "When to pick CallGrabbr",
        paragraphs: [
          "Choose CallGrabbr if you want contractor-first packaging, a simple trial with no card, and plans that map to missed-only vs most-inbound coverage.",
          "Stay open to Rosie (or similar) if their current packaging, voice quality, or integrations fit your shop better after a live side-by-side test — judge on captured jobs, not homepage demos.",
        ],
      },
    ],
    comparison: {
      competitorName: "Rosie",
      rows: [
        { label: "Category", callgrabbr: CATEGORY_NAME, competitor: "AI phone receptionist (general SMB)" },
        { label: "Entry price", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: "~$49/mo (answers phones)" },
        { label: "Trade intake", callgrabbr: "Built for service jobs", competitor: "Varies by setup" },
        { label: "Lead delivery", callgrabbr: "SMS & email in seconds", competitor: "Varies by product" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is CallGrabbr the same as Rosie?",
        answer:
          "No. Both pick up phones when you can't, but CallGrabbr is missed-call lead capture packaged for contractors — turning missed and after-hours calls into job-ready leads with trade-style intake.",
      },
      {
        question: "How should I compare CallGrabbr and Rosie?",
        answer:
          "Forward a test line to each, place the same emergency-style call, and compare the lead summary and time-to-text. Pick the one that feels like a job ticket your crew can act on.",
      },
      {
        question: "Can I try CallGrabbr without a card?",
        answer: `Yes. ${trialSummaryShort()}. Forward your line and test with real calls.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs OnCrew", href: "/guides/callgrabbr-vs-oncrew" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "Missed-call lead capture vs AI answering", href: "/guides/missed-call-lead-capture-vs-ai-answering" },
      { label: "Lead capture vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "CallGrabbr vs Rosie",
      "Rosie missed call alternative",
      "missed call lead capture contractors",
      "Rosie vs CallGrabbr",
    ],
  },
  {
    slug: "callgrabbr-vs-oncrew",
    title: "CallGrabbr vs OnCrew: Which Fits Trade Shops?",
    description:
      "Compare CallGrabbr and OnCrew for HVAC, plumbing, and home-service shops. Missed-call capture, after-hours coverage, and how to pick the right lead capture stack.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs OnCrew",
    intro:
      "Peak season means more rings than you can answer. OnCrew and CallGrabbr both target home-service operators who can't afford lost calls — here's a practical way to compare them without a feature checklist war.",
    sections: [
      {
        heading: "Start with the job you lose",
        paragraphs: [
          "You're finishing a changeout. The phone rings in the truck. By the time you call back, the homeowner booked someone else. That scene — not a feature matrix — is what lead capture tools are for.",
          `${formatJobValuePromptLine()} The right product is the one that recovers that job without forcing you into a full receptionist budget.`,
        ],
      },
      {
        heading: "CallGrabbr's lane",
        paragraphs: [
          `CallGrabbr picks up when you forward the line, collects trade-relevant details, and texts or emails you the lead. ${PLAN_BASIC} ($${basic.price}/mo) for missed and after-hours; ${PLAN_GROWTH} ($${growth.price}/mo) when you want most inbound handled; ${PLAN_PLATINUM} ($${platinum.price}/mo) for busy multi-crew shops.`,
          `${trialSummaryShort()}. Keep your existing business number.`,
        ],
      },
      {
        heading: "How to evaluate OnCrew fairly",
        paragraphs: [
          "Look at how they handle after-hours emergencies, what lands in your pocket after a call, and total monthly cost at your volume — not just the entry price.",
          "If OnCrew's workflow, CRM hooks, or packaging fit your operation better after a live test, use that. CallGrabbr wins when you want simple contractor pricing and fast lead texts without a heavy platform.",
        ],
        bullets: [
          "Mystery-shop both with the same emergency script",
          "Compare time-to-text and completeness of address / urgency",
          "Map monthly cost to missed-only vs always-on coverage",
        ],
      },
      {
        heading: "Bottom line",
        paragraphs: [
          "Pick CallGrabbr when your north star is trial → first captured lead → paid, with clear Basic / Growth / Platinum steps.",
          "Stay open to OnCrew if their current product surface matches how your dispatch or CRM already works — decide after real call tests, not Ad Library screenshots.",
        ],
      },
    ],
    comparison: {
      competitorName: "OnCrew",
      rows: [
        { label: "Built for", callgrabbr: "Local service / trades", competitor: "Home-service operations (varies)" },
        { label: "CallGrabbr entry", callgrabbr: `$${basic.price}/mo missed & after-hours`, competitor: "Check current public pricing" },
        { label: "Lead alerts", callgrabbr: "SMS & email in seconds", competitor: "Varies by setup" },
        { label: "Number change required?", callgrabbr: "No — forward your line", competitor: "Depends on product" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is CallGrabbr a replacement for OnCrew?",
        answer:
          "It can be for shops whose main pain is missed and after-hours calls becoming lost jobs. If you rely on a broader operations suite from OnCrew, compare workflows side by side before switching.",
      },
      {
        question: "What should HVAC owners test first?",
        answer:
          "Forward after hours, call in with a no-cool or no-heat scenario, and see whether the summary includes address and urgency fast enough to call back before the next contractor.",
      },
      {
        question: "How do I start CallGrabbr?",
        answer: `Start a ${trialDaysLabel()} free trial with no card, add your business phone, and set call forwarding. Setup is usually about five minutes.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Rosie", href: "/guides/callgrabbr-vs-rosie" },
      { label: "After-hours lead capture for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Lead capture vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "HVAC landing page", href: "/for/hvac" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "CallGrabbr vs OnCrew",
      "OnCrew alternative",
      "home service missed call capture",
      "HVAC lead capture comparison",
    ],
  },
  {
    slug: "best-ai-answering-for-plumbing-2026",
    title: "After-Hours & Missed-Call Lead Capture for Plumbing (2026)",
    description:
      "What plumbing owners should look for in after-hours and missed-call lead capture in 2026: 2 AM emergencies, leak intake, and how CallGrabbr fits.",
    eyebrow: "Plumbing buyer guide · 2026",
    headline: "After-hours & missed-call lead capture for plumbing (2026)",
    intro:
      "It's 2 AM. Water is running under a sink. The homeowner calls you, hangs up when you don't answer, and dials the next plumber. The best missed-call lead capture setup for plumbing shops catches that call, flags the emergency, and texts you before they book someone else.",
    sections: [
      {
        heading: "What “best” means for plumbers",
        paragraphs: [
          "Skip generic receptionist demos. For plumbing, best means: picks up when you're on a job or asleep, asks whether it's a leak or flood, grabs the address, and gets the lead to your phone in seconds.",
          "Live receptionist plans from ~$235+/mo work — but many shops don't need a human on every ring. They need the emergency details before the next plumber picks up.",
        ],
        bullets: [
          "After-hours and weekend coverage via forwarding",
          "Intake: leak vs clog, address, urgency / flooding",
          "Instant SMS or email with the lead summary",
          "Pricing that fits one-truck shops and growing crews",
        ],
      },
      {
        heading: "How CallGrabbr fits plumbing",
        paragraphs: [
          `CallGrabbr picks up when you forward the line, collects plumbing-relevant details, and alerts you immediately. ${PLAN_BASIC} ($${basic.price}/mo) covers missed and after-hours. ${PLAN_GROWTH} ($${growth.price}/mo) is for shops that want most inbound handled. ${PLAN_PLATINUM} ($${platinum.price}/mo) fits multi-crew volume.`,
          `${formatJobValuePromptLine()} One recovered after-hours emergency often covers months of lead capture.`,
        ],
      },
      {
        heading: "How to evaluate any vendor",
        paragraphs: [
          "Mystery-shop after hours: describe an active leak and check whether the summary includes address and urgency. Time-to-text beats a polished homepage.",
          "Compare total monthly cost at your real volume. Entry receptionist tools near $49/mo exist; human services start much higher. CallGrabbr sits in the middle with trade-specific intake.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          `Start a ${trialDaysLabel()} trial, forward after hours (or always), and place a test call. If the lead text looks like a job ticket, you're close to the right setup.`,
        ],
      },
    ],
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "What is the best missed-call lead capture for plumbing companies?",
        answer: `Look for after-hours coverage, plumbing-style intake (leak, address, urgency), and instant lead alerts. CallGrabbr is built for that workflow, with ${PLAN_BASIC} from $${basic.price}/mo and a ${trialDaysLabel()} free trial.`,
      },
      {
        question: "Should plumbers use lead capture or a live receptionist?",
        answer: `If you mainly lose jobs on missed and after-hours rings, missed-call lead capture is usually enough and far cheaper than live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo. Choose live or hybrid receptionist software if you need a human on every call.`,
      },
      {
        question: "Does CallGrabbr handle emergency leak calls?",
        answer:
          "Yes. CallGrabbr collects urgency and service details so you know which callbacks to prioritize when you get the text or email summary.",
      },
    ],
    relatedLinks: [
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "Lead capture vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "After-hours lead capture cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "plumbing missed call lead capture",
      "plumbing lead capture 2026",
      "plumber voicemail alternative",
      "after hours plumbing phone answering",
    ],
  },
  {
    slug: "ai-vs-live-answering-for-contractors",
    title: "Missed-Call Lead Capture vs Live Receptionist for Contractors",
    description: `Missed-call lead capture vs live receptionists for HVAC and plumbing: cost from $${basic.price}/mo vs ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo, when you need a human on every ring, and how to choose.`,
    eyebrow: "Buyer guide",
    headline: "Missed-call lead capture vs live receptionist for contractors",
    intro:
      "You're on a job. The phone rings. Someone has to pick up — or the homeowner calls your competitor. The question isn't lead capture or nothing. It's whether you need a human on every ring, or missed-call lead capture that grabs the job when you can't.",
    sections: [
      {
        heading: "What each option is really buying",
        paragraphs: [
          "Live receptionist services buy a human voice, judgment, and often complex transfers — typically from around $235/month and up with volume.",
          "Missed-call lead capture buys consistent pickup, trade-style questions, and a lead text when you're unavailable — usually a fraction of live receptionist pricing.",
        ],
      },
      {
        heading: "When lead capture is enough",
        paragraphs: [
          "Most one-truck and small-crew shops lose work because nobody answered — not because the greeting wasn't human enough. If your pain is missed and after-hours calls, lead capture that texts you the address and urgency usually wins on cost per captured job.",
          `${formatJobValuePromptLine()} One recovered emergency often beats months of either option.`,
        ],
        bullets: [
          "You're on jobs all day and can't babysit the shop phone",
          "After-hours emergencies matter more than brand-perfect small talk",
          "You want a trial without a long contract",
        ],
      },
      {
        heading: "When live (or hybrid) still wins",
        paragraphs: [
          "Choose live or hybrid receptionist software if you need complex live transfers, multi-department phone trees, or a human receptionist as a brand requirement on every ring.",
          "Some shops run lead capture for overflow and after hours, and keep live coverage for peak daytime — that's a valid stack if the math still works.",
        ],
      },
      {
        heading: "How CallGrabbr fits",
        paragraphs: [
          `CallGrabbr is ${CATEGORY_NAME} for contractors: ${PLAN_BASIC} $${basic.price}/mo for missed and after-hours, ${PLAN_GROWTH} $${growth.price}/mo when you want most inbound handled, ${PLAN_PLATINUM} $${platinum.price}/mo for busy shops. ${trialSummaryShort()}.`,
          "If you later need a human on every call, you can still add a live receptionist service — start by stopping the silent losses first.",
        ],
      },
    ],
    comparison: {
      competitorName: "Live receptionist",
      rows: [
        { label: "Typical starting cost", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: `~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo` },
        { label: "Category", callgrabbr: CATEGORY_NAME, competitor: "Live receptionist service" },
        { label: "Best for", callgrabbr: "Missed / after-hours job capture", competitor: "Human on every ring, complex transfers" },
        { label: "Lead alerts", callgrabbr: "SMS & email in seconds", competitor: "Depends on service" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is missed-call lead capture good enough for HVAC and plumbing?",
        answer:
          "For capturing missed and after-hours jobs — name, phone, address, urgency — yes for most shops. Use live receptionist services if you need a human on every call or complex live transfers.",
      },
      {
        question: "How much cheaper is lead capture than a live receptionist?",
        answer: `CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo. Live receptionist services often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo and climb with minutes. Exact savings depend on your volume.`,
      },
      {
        question: "Can I switch from live receptionist to CallGrabbr?",
        answer: `Yes. Start a ${trialDaysLabel()} trial, forward a test line (or after-hours only), and compare lead quality before you cancel an existing service.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "After-hours lead capture cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "After-hours lead capture for plumbing", href: "/guides/best-ai-answering-for-plumbing-2026" },
      { label: "After-hours lead capture for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "missed call lead capture vs live receptionist",
      "lead capture vs human receptionist",
      "contractor missed call capture",
      "virtual receptionist vs lead capture for HVAC",
    ],
  },
  {
    slug: "missed-call-lead-capture-vs-ai-answering",
    title: "Missed-Call Lead Capture vs AI Answering for Contractors",
    description: `${PRODUCT_ONE_LINER} Compare missed-call lead capture to AI answering and receptionist software — trade intake, SMS alerts, missed-only plans, and why one captured job pays for months.`,
    eyebrow: "Category guide",
    headline: "Missed-call lead capture vs AI answering",
    intro:
      "AI answering tools and receptionist software compete on who picks up the phone. CallGrabbr competes on revenue — capturing trade job details when you miss a ring and texting you the lead in seconds. This guide explains the difference so you don't buy the wrong category.",
    sections: [
      {
        heading: "Two different problems",
        paragraphs: [
          "Receptionist software (Ruby, Smith.ai, Rosie, and similar) sells a voice on your line — human or AI — often priced per minute or as a full-time front desk.",
          `${PRODUCT_ONE_LINER} You're not buying a receptionist. You're buying back jobs that would have gone to voicemail or your competitor.`,
        ],
      },
      {
        heading: "What contractors actually need",
        paragraphs: [
          "When you're under a sink or on a roof, you don't need small talk. You need name, phone, address, what's broken, and how urgent — in a text you can act on before the homeowner dials the next contractor.",
          `${formatJobValuePromptLine()} That's the ROI test: one captured emergency job, not how polished the greeting sounds.`,
        ],
        bullets: [
          "Job details built for trades — not generic message-taking",
          "SMS or email lead summary in seconds",
          "A missed-only plan so you're not paying for rings you already answer",
          "Pricing that pays for itself with one recovered job",
        ],
      },
      {
        heading: "The Rosie price trap",
        paragraphs: [
          ROSIE_PRICE_OBJECTION,
          `CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo (${BASIC_FRAME}). We don't race receptionist tools to ~$49/mo — we sell cost per captured job and intake depth that lets you sell the call back.`,
        ],
      },
      {
        heading: "When receptionist software still fits",
        paragraphs: [
          "Choose AI answering or live receptionist platforms if you need a human-quality voice on every ring, complex live transfers, or multi-department phone trees as a brand requirement.",
          "Choose CallGrabbr if your main leak is missed and after-hours revenue — and you want a trial, clear Basic / Growth / Platinum steps, and lead texts that read like job tickets.",
        ],
      },
    ],
    comparison: {
      competitorName: "AI answering / receptionist tools",
      rows: [
        { label: "Captures job details for trades", callgrabbr: "Built in — issue, address, urgency", competitor: "Often generic transcripts" },
        { label: "SMS lead in seconds", callgrabbr: "Yes — text & email alerts", competitor: "Varies by product" },
        { label: "Missed-only plan", callgrabbr: `${PLAN_BASIC} — ${BASIC_FRAME}`, competitor: "Usually full-time answering" },
        { label: "Pays for itself with 1 job", callgrabbr: "Yes — typical emergency ROI", competitor: "Depends on volume & intake" },
        { label: "Entry price", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: "e.g. Rosie ~$49/mo (answers phones)" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is CallGrabbr an AI answering service?",
        answer:
          "No. CallGrabbr is missed-call lead capture for trades. It picks up when you can't answer and texts you job-ready lead details. AI answering tools compete as receptionist software — CallGrabbr competes on captured revenue.",
      },
      {
        question: "Why is CallGrabbr more than ~$49/mo tools like Rosie?",
        answer: ROSIE_PRICE_OBJECTION,
      },
      {
        question: "Can I use CallGrabbr only for missed calls?",
        answer: `Yes. ${PLAN_BASIC} ($${basic.price}/mo) is ${BASIC_FRAME.toLowerCase()} — forward after hours or when unanswered, and keep daytime rings on your phone if you prefer.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Rosie", href: "/guides/callgrabbr-vs-rosie" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "Lead capture vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "Full comparison hub", href: "/compare" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "missed call lead capture vs AI answering",
      "AI answering alternative for contractors",
      "missed call capture for trades",
      "voicemail alternative for HVAC plumbing",
    ],
  },
]

export function getAllGuides(): Guide[] {
  return GUIDES
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug)
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug.toLowerCase())
}
