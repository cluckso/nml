import {
  formatJobValuePromptLine,
  HUMAN_RECEPTIONIST_FROM_MONTHLY,
  PRICING_TIERS_BY_KEY,
} from "@/lib/pricing-catalog"
import { PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
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
    title: "CallGrabbr vs Ruby: Which Answering Service Fits Contractors?",
    description: `Compare CallGrabbr and Ruby for HVAC, plumbing, and trade shops. Pricing, lead capture, after-hours coverage, and when a live receptionist is worth $${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo.`,
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Ruby",
    intro:
      "Ruby is a well-known live answering service. CallGrabbr is built for contractors who need missed and after-hours calls captured as job-ready leads — without paying full receptionist rates. Here’s how they differ for local service businesses.",
    sections: [
      {
        heading: "Who each option is for",
        paragraphs: [
          "Ruby fits businesses that want a human voice on every call and can budget for live receptionist pricing — often starting around $235/month and climbing with volume.",
          "CallGrabbr fits one-truck and growing trade shops that lose jobs when the phone rings during a service call or after hours. Plans start at Basic for missed and after-hours coverage, with Growth and Platinum when you want more inbound answered like a front desk.",
        ],
      },
      {
        heading: "Pricing snapshot",
        paragraphs: [
          `Ruby-style live answering typically starts near $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/month and rises with minutes and features.`,
          `CallGrabbr: ${PLAN_BASIC} $${basic.price}/mo · ${PLAN_GROWTH} $${growth.price}/mo · ${PLAN_PLATINUM} $${platinum.price}/mo. ${trialSummaryShort()}. ${formatJobValuePromptLine()} Capture one you'd have lost and the plan often pays for itself for months.`,
        ],
      },
      {
        heading: "Lead capture for trades",
        paragraphs: [
          "Contractors need more than a message: name, callback number, address, urgency, and what broke. CallGrabbr is tuned for service intake and texts or emails you the lead summary in seconds.",
          "Ruby can take detailed messages with trained agents. You’re paying for human judgment and conversation quality — valuable if brand voice and complex phone trees matter more than cost per captured job.",
        ],
        bullets: [
          "CallGrabbr: AI intake for HVAC, plumbing, and other local services; instant SMS/email lead alerts",
          "Ruby: live agents; stronger when you need a human on every ring",
          "Both: can cover after hours when you configure forwarding",
        ],
      },
      {
        heading: "When to choose CallGrabbr",
        paragraphs: [
          "Choose CallGrabbr if your main problem is missed jobs while you’re on a ladder, under a sink, or closed for the night — and one recovered emergency call covers months of software.",
          "Stick with (or add) a live service like Ruby if you need complex live transfers, white-glove scripting across many departments, or a human receptionist as a brand requirement.",
        ],
      },
    ],
    comparison: {
      competitorName: "Ruby",
      rows: [
        { label: "Starting price (typical)", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: `~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo` },
        { label: "Who answers", callgrabbr: "AI call assistant", competitor: "Live receptionists" },
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
        answer: `Usually yes for contractor shops. CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo for missed and after-hours capture. Live answering services like Ruby often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo and scale with usage.`,
      },
      {
        question: "Can CallGrabbr replace a live answering service?",
        answer:
          "For many HVAC and plumbing shops, yes — if your goal is capturing job details when you can’t pick up. If you need a human on every call for brand or complex transfers, a live service may still fit better (or alongside AI for overflow).",
      },
      {
        question: "Does CallGrabbr work after hours?",
        answer:
          "Yes. Forward your business line (or after-hours only) and CallGrabbr answers, captures the lead, and texts or emails you so you can call back first.",
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Smith.ai", href: "/guides/callgrabbr-vs-smith-ai" },
      { label: "After-hours answering cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "AI answering for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "HVAC landing page", href: "/for/hvac" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: ["CallGrabbr vs Ruby", "Ruby answering service alternative", "contractor answering service", "HVAC answering service"],
  },
  {
    slug: "callgrabbr-vs-smith-ai",
    title: "CallGrabbr vs Smith.ai: AI Answering for Service Businesses",
    description:
      "Compare CallGrabbr and Smith.ai for contractors. Hybrid receptionist pricing (~$95–$300+), trade-focused lead capture, and when a simpler AI answering plan wins.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Smith.ai",
    intro:
      "Smith.ai offers AI and hybrid live answering for many industries. CallGrabbr focuses on local service businesses — especially HVAC and plumbing — with clear trade pricing and job-ready lead alerts. Use this guide to pick the right fit.",
    sections: [
      {
        heading: "Positioning difference",
        paragraphs: [
          "Smith.ai is a broad receptionist platform (AI plus optional live agents). Public hybrid pricing often lands roughly in the $95–$300+/month range depending on minutes and human backup.",
          `CallGrabbr is narrower on purpose: stop losing contractor jobs to missed and after-hours calls. ${PLAN_BASIC} covers the rings you miss; ${PLAN_GROWTH} and ${PLAN_PLATINUM} step up when you want more of the line answered around the clock.`,
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
          "Homeowners calling about no heat, a leak, or a breaker trip expect fast questions: what’s wrong, where, how urgent. CallGrabbr’s industry flows are built around that.",
          "Smith.ai can be configured for many verticals. Expect more setup if you want the same depth of trade-specific intake out of the box.",
        ],
        bullets: [
          "CallGrabbr: SMS/email lead summaries tuned for service jobs",
          "Smith.ai: AI + optional live agents; strong if you need hybrid coverage",
          "Both: work with call forwarding for after-hours",
        ],
      },
      {
        heading: "Bottom line",
        paragraphs: [
          "Pick CallGrabbr when you’re a contractor optimizing for cost per captured job and speed-to-lead after missed rings.",
          "Pick Smith.ai (or a hybrid) when you want a generalist receptionist stack with live backup as a core product feature — and you’re ready for that pricing band.",
        ],
      },
    ],
    comparison: {
      competitorName: "Smith.ai",
      rows: [
        { label: "Typical monthly range", callgrabbr: `$${basic.price}–$${platinum.price}`, competitor: "~$95–$300+" },
        { label: "Focus", callgrabbr: "Local service / trades", competitor: "Broad SMB receptionist" },
        { label: "Live agents", callgrabbr: "AI-first", competitor: "AI + hybrid live options" },
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
          "No. Smith.ai is a general AI/hybrid answering platform. CallGrabbr is built specifically for contractors who need missed-call and after-hours lead capture with trade-style intake.",
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
      { label: "After-hours answering cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: ["CallGrabbr vs Smith.ai", "Smith.ai alternative", "AI answering service contractors", "plumber answering service"],
  },
  {
    slug: "best-ai-answering-for-hvac-2026",
    title: "Best AI Answering for HVAC in 2026",
    description:
      "What HVAC owners should look for in an AI answering service in 2026: after-hours coverage, emergency intake, pricing, and how CallGrabbr compares for no-heat and no-AC calls.",
    eyebrow: "HVAC buyer guide · 2026",
    headline: "Best AI answering for HVAC (2026)",
    intro:
      "Peak season and after-hours no-heat / no-AC calls don’t wait. The best AI answering setup for HVAC shops captures address, system issue, and urgency — then texts you so you call back before the homeowner dials the next contractor.",
    sections: [
      {
        heading: "What “best” means for HVAC in 2026",
        paragraphs: [
          "Skip vanity features. For HVAC, best means: answers when techs can’t, asks the right questions, flags emergencies, and delivers a lead you can act on in seconds.",
          "Budget tools that only leave a name and number still lose jobs. Live receptionist plans at $235+/mo work, but many shops don’t need a human on every ring — they need the emergency job details.",
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
          `CallGrabbr answers when you forward the line, collects HVAC-relevant details, and alerts you immediately. ${PLAN_BASIC} ($${basic.price}/mo) covers missed and after-hours. ${PLAN_GROWTH} ($${growth.price}/mo) is for shops that want most inbound answered like a 24/7 desk. ${PLAN_PLATINUM} ($${platinum.price}/mo) fits multi-crew volume.`,
          `${formatJobValuePromptLine()} One recovered HVAC emergency often covers months of answering.`,
        ],
      },
      {
        heading: "How to evaluate any AI answering vendor",
        paragraphs: [
          "Run a live test: call after hours, describe a furnace that won’t start, and check whether the summary includes address and urgency. Time-to-text matters more than a polished homepage.",
          "Compare total monthly cost at your real volume — not just the entry price. Entry AI tools near $49/mo exist; human services start much higher. CallGrabbr sits in the middle with trade-specific intake.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          `Start a ${trialDaysLabel()} trial, forward your business line (or after-hours only), and place a test call. If the lead text looks like a job ticket, you’re close to the right setup.`,
        ],
      },
    ],
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "What is the best AI answering service for HVAC companies?",
        answer: `Look for after-hours coverage, HVAC-style intake (issue, address, urgency), and instant lead alerts. CallGrabbr is built for that workflow, with ${PLAN_BASIC} from $${basic.price}/mo and a ${trialDaysLabel()} free trial.`,
      },
      {
        question: "Should HVAC companies use AI or a live answering service?",
        answer: `If you mainly lose jobs on missed and after-hours rings, AI answering is usually enough and far cheaper than live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo. Choose live or hybrid if you need a human on every call.`,
      },
      {
        question: "Does CallGrabbr handle emergency no-heat calls?",
        answer:
          "Yes. The assistant can collect urgency and service details so you know which callbacks to prioritize when you get the text or email summary.",
      },
    ],
    relatedLinks: [
      { label: "HVAC answering landing page", href: "/for/hvac" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "After-hours answering cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "best AI answering for HVAC",
      "HVAC answering service 2026",
      "AI receptionist HVAC",
      "after hours HVAC phone answering",
    ],
  },
  {
    slug: "after-hours-answering-cost-for-contractors",
    title: "After-Hours Answering Cost for Contractors (2026)",
    description: `What contractors actually pay for after-hours answering: live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo, hybrid AI ~$95–$300+, and CallGrabbr from $${basic.price}/mo — plus the cost of one missed emergency job.`,
    eyebrow: "Cost guide",
    headline: "After-hours answering cost for contractors",
    intro:
      "After-hours calls are often your highest-value jobs — and the ones that go to whoever picks up first. Here’s what after-hours answering typically costs in 2026, and how to think about ROI.",
    sections: [
      {
        heading: "What shops usually pay",
        paragraphs: [
          `Live answering services (e.g. Ruby-style) often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/month and climb with minutes.`,
          "Hybrid AI + live platforms (e.g. Smith.ai-style) commonly land roughly $95–$300+/month depending on human backup and volume.",
          `Entry AI receptionist tools may advertise near $49/mo. CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo for missed and after-hours capture — with ${PLAN_GROWTH} at $${growth.price}/mo and ${PLAN_PLATINUM} at $${platinum.price}/mo when you need more coverage.`,
        ],
      },
      {
        heading: "The real cost: missed emergencies",
        paragraphs: [
          `${formatJobValuePromptLine()} For HVAC, plumbing, and similar trades, that one after-hours job can cover months of CallGrabbr.`,
          "Voicemail is free until it isn’t — most emergency callers hang up and dial the next number on the list.",
        ],
      },
      {
        heading: "How to size the right plan",
        paragraphs: [
          `${PLAN_BASIC}: you’re on jobs all day and mainly need evenings, weekends, and the rings you miss.`,
          `${PLAN_GROWTH}: you want most inbound answered so the shop phone never goes to voicemail during busy hours.`,
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
        heading: "DIY vs answering service",
        paragraphs: [
          "Forwarding to a personal cell after hours is free but burns your evenings and still drops calls when you’re unavailable. An answering layer (AI or live) exists so the caller gets intake instead of a busy signal or voicemail.",
        ],
      },
    ],
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "How much does after-hours answering cost for contractors?",
        answer: `Expect ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo for live receptionists, roughly $95–$300+ for many hybrid AI plans, and from $${basic.price}/mo for CallGrabbr ${PLAN_BASIC} missed and after-hours coverage.`,
      },
      {
        question: "Is after-hours answering worth it?",
        answer: `Usually yes if you take emergency work. ${formatJobValuePromptLine()} One missed job often exceeds several months of AI answering.`,
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
      { label: "Best AI answering for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "after hours answering cost",
      "contractor answering service price",
      "after hours phone answering HVAC",
      "plumber after hours answering service",
    ],
  },
  {
    slug: "callgrabbr-vs-rosie",
    title: "CallGrabbr vs Rosie: AI Answering for Contractors",
    description:
      "Compare CallGrabbr and Rosie for HVAC and plumbing shops. Trade intake, missed-call capture, pricing, and when each AI answering tool fits.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs Rosie",
    intro:
      "You're under a truck or on a roof when the phone rings. Rosie and CallGrabbr both aim to catch that call with AI — but they're built for slightly different shops. Here's how to choose.",
    sections: [
      {
        heading: "The scene both products solve",
        paragraphs: [
          "A homeowner with no AC or a burst pipe will not wait on voicemail. They dial the next number. Any AI answering tool that picks up and captures the job details beats silence.",
          "The difference is how deep the trade intake goes, how leads get to you, and whether the pricing matches a one-truck shop or a growing crew.",
        ],
      },
      {
        heading: "Where CallGrabbr focuses",
        paragraphs: [
          `CallGrabbr is built for local service businesses — HVAC, plumbing, electrical, auto, and similar trades. ${PLAN_BASIC} covers the rings you miss; ${PLAN_GROWTH} and ${PLAN_PLATINUM} step up when you want most inbound answered like a front desk.`,
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
        heading: "How to evaluate Rosie (or any peer AI tool)",
        paragraphs: [
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
        { label: "Primary focus", callgrabbr: "Local service / trades", competitor: "AI phone answering (general SMB)" },
        { label: "Starting plan (CallGrabbr)", callgrabbr: `$${basic.price}/mo (${PLAN_BASIC})`, competitor: "Check current public pricing" },
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
          "No. Both use AI to answer phones, but CallGrabbr is packaged for contractors who need missed and after-hours calls turned into job-ready leads with trade-style intake.",
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
      { label: "AI vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "CallGrabbr vs Rosie",
      "Rosie AI answering alternative",
      "AI answering service contractors",
      "Rosie vs CallGrabbr",
    ],
  },
  {
    slug: "callgrabbr-vs-oncrew",
    title: "CallGrabbr vs OnCrew: Which Fits Trade Shops?",
    description:
      "Compare CallGrabbr and OnCrew for HVAC, plumbing, and home-service shops. Missed-call capture, after-hours coverage, and how to pick the right answering stack.",
    eyebrow: "Comparison guide",
    headline: "CallGrabbr vs OnCrew",
    intro:
      "Peak season means more rings than you can answer. OnCrew and CallGrabbr both target home-service operators who can't afford lost calls — here's a practical way to compare them without a feature checklist war.",
    sections: [
      {
        heading: "Start with the job you lose",
        paragraphs: [
          "You're finishing a changeout. The phone rings in the truck. By the time you call back, the homeowner booked someone else. That scene — not a feature matrix — is what answering tools are for.",
          `${formatJobValuePromptLine()} The right product is the one that recovers that job without forcing you into a full receptionist budget.`,
        ],
      },
      {
        heading: "CallGrabbr's lane",
        paragraphs: [
          `CallGrabbr answers when you forward the line, collects trade-relevant details, and texts or emails you the lead. ${PLAN_BASIC} ($${basic.price}/mo) for missed and after-hours; ${PLAN_GROWTH} ($${growth.price}/mo) when you want most inbound answered; ${PLAN_PLATINUM} ($${platinum.price}/mo) for busy multi-crew shops.`,
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
          "Map monthly cost to missed-only vs always-on answering",
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
      { label: "Best AI answering for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "AI vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "HVAC landing page", href: "/for/hvac" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "CallGrabbr vs OnCrew",
      "OnCrew alternative",
      "home service answering service",
      "HVAC AI answering comparison",
    ],
  },
  {
    slug: "best-ai-answering-for-plumbing-2026",
    title: "Best AI Answering for Plumbing in 2026",
    description:
      "What plumbing owners should look for in an AI answering service in 2026: 2 AM emergencies, leak intake, after-hours coverage, and how CallGrabbr fits.",
    eyebrow: "Plumbing buyer guide · 2026",
    headline: "Best AI answering for plumbing (2026)",
    intro:
      "It's 2 AM. Water is running under a sink. The homeowner calls you, hangs up when you don't answer, and dials the next plumber. The best AI answering setup for plumbing shops catches that call, flags the emergency, and texts you before they book someone else.",
    sections: [
      {
        heading: "What “best” means for plumbers",
        paragraphs: [
          "Skip generic receptionist demos. For plumbing, best means: answers when you're on a job or asleep, asks whether it's a leak or flood, grabs the address, and gets the lead to your phone in seconds.",
          "Live answering from ~$235+/mo works — but many shops don't need a human on every ring. They need the emergency details before the next plumber picks up.",
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
          `CallGrabbr answers when you forward the line, collects plumbing-relevant details, and alerts you immediately. ${PLAN_BASIC} ($${basic.price}/mo) covers missed and after-hours. ${PLAN_GROWTH} ($${growth.price}/mo) is for shops that want most inbound answered. ${PLAN_PLATINUM} ($${platinum.price}/mo) fits multi-crew volume.`,
          `${formatJobValuePromptLine()} One recovered after-hours emergency often covers months of answering.`,
        ],
      },
      {
        heading: "How to evaluate any vendor",
        paragraphs: [
          "Mystery-shop after hours: describe an active leak and check whether the summary includes address and urgency. Time-to-text beats a polished homepage.",
          "Compare total monthly cost at your real volume. Entry AI tools near $49/mo exist; human services start much higher. CallGrabbr sits in the middle with trade-specific intake.",
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
        question: "What is the best AI answering service for plumbing companies?",
        answer: `Look for after-hours coverage, plumbing-style intake (leak, address, urgency), and instant lead alerts. CallGrabbr is built for that workflow, with ${PLAN_BASIC} from $${basic.price}/mo and a ${trialDaysLabel()} free trial.`,
      },
      {
        question: "Should plumbers use AI or a live answering service?",
        answer: `If you mainly lose jobs on missed and after-hours rings, AI answering is usually enough and far cheaper than live receptionists from ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo. Choose live or hybrid if you need a human on every call.`,
      },
      {
        question: "Does CallGrabbr handle emergency leak calls?",
        answer:
          "Yes. The assistant can collect urgency and service details so you know which callbacks to prioritize when you get the text or email summary.",
      },
    ],
    relatedLinks: [
      { label: "Plumbing landing page", href: "/for/plumbing" },
      { label: "AI vs live receptionist", href: "/guides/ai-vs-live-answering-for-contractors" },
      { label: "After-hours answering cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "best AI answering for plumbing",
      "plumbing answering service 2026",
      "AI receptionist plumber",
      "after hours plumbing phone answering",
    ],
  },
  {
    slug: "ai-vs-live-answering-for-contractors",
    title: "AI vs Live Answering for Contractors",
    description: `AI answering vs live receptionists for HVAC and plumbing: cost from $${basic.price}/mo vs ~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo, when you need a human on every ring, and how to choose.`,
    eyebrow: "Buyer guide",
    headline: "AI vs live answering for contractors",
    intro:
      "You're on a job. The phone rings. Someone has to pick up — or the homeowner calls your competitor. The question isn't “AI or nothing.” It's whether you need a human on every ring, or an AI that captures the job when you can't.",
    sections: [
      {
        heading: "What each option is really buying",
        paragraphs: [
          "Live answering buys a human voice, judgment, and often complex transfers — typically from around $235/month and up with volume.",
          "AI answering buys consistent pickup, trade-style questions, and a lead text when you're unavailable — usually a fraction of live receptionist pricing.",
        ],
      },
      {
        heading: "When AI is enough",
        paragraphs: [
          "Most one-truck and small-crew shops lose work because nobody answered — not because the greeting wasn't human enough. If your pain is missed and after-hours calls, AI that texts you the address and urgency usually wins on cost per captured job.",
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
          "Choose live or hybrid if you need complex live transfers, multi-department phone trees, or a human receptionist as a brand requirement on every ring.",
          "Some shops run AI for overflow and after hours, and keep live coverage for peak daytime — that's a valid stack if the math still works.",
        ],
      },
      {
        heading: "How CallGrabbr fits",
        paragraphs: [
          `CallGrabbr is AI-first for contractors: ${PLAN_BASIC} $${basic.price}/mo for missed and after-hours, ${PLAN_GROWTH} $${growth.price}/mo when you want most inbound answered, ${PLAN_PLATINUM} $${platinum.price}/mo for busy shops. ${trialSummaryShort()}.`,
          "If you later need a human on every call, you can still add a live service — start by stopping the silent losses first.",
        ],
      },
    ],
    comparison: {
      competitorName: "Live receptionist",
      rows: [
        { label: "Typical starting cost", callgrabbr: `$${basic.price}/mo AI (${PLAN_BASIC})`, competitor: `~$${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/mo` },
        { label: "Who answers", callgrabbr: "AI call assistant", competitor: "Live agents" },
        { label: "Best for", callgrabbr: "Missed / after-hours job capture", competitor: "Human on every ring, complex transfers" },
        { label: "Lead alerts", callgrabbr: "SMS & email in seconds", competitor: "Depends on service" },
        { label: "Trial", callgrabbr: `${trialDaysLabel()} free · no card`, competitor: "Varies" },
      ],
    },
    showPricingSnippet: true,
    showDemo: true,
    faq: [
      {
        question: "Is AI answering good enough for HVAC and plumbing?",
        answer:
          "For capturing missed and after-hours jobs — name, phone, address, urgency — yes for most shops. Use live answering if you need a human on every call or complex live transfers.",
      },
      {
        question: "How much cheaper is AI than a live receptionist?",
        answer: `CallGrabbr ${PLAN_BASIC} is $${basic.price}/mo. Live receptionist services often start around $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo and climb with minutes. Exact savings depend on your volume.`,
      },
      {
        question: "Can I switch from live answering to CallGrabbr?",
        answer: `Yes. Start a ${trialDaysLabel()} trial, forward a test line (or after-hours only), and compare lead quality before you cancel an existing service.`,
      },
    ],
    relatedLinks: [
      { label: "CallGrabbr vs Ruby", href: "/guides/callgrabbr-vs-ruby" },
      { label: "After-hours answering cost", href: "/guides/after-hours-answering-cost-for-contractors" },
      { label: "Best AI answering for plumbing", href: "/guides/best-ai-answering-for-plumbing-2026" },
      { label: "Best AI answering for HVAC", href: "/guides/best-ai-answering-for-hvac-2026" },
      { label: "Pricing", href: "/pricing" },
    ],
    keywords: [
      "AI vs live answering service",
      "AI receptionist vs human",
      "contractor answering service AI or live",
      "virtual receptionist vs AI for HVAC",
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
