import {
  AVG_JOB_VALUE_HIGH,
  AVG_JOB_VALUE_LOW,
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
          `CallGrabbr: ${PLAN_BASIC} $${basic.price}/mo · ${PLAN_GROWTH} $${growth.price}/mo · ${PLAN_PLATINUM} $${platinum.price}/mo. ${trialSummaryShort()}. One captured job ($${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH} average) often pays for months of service.`,
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
          `Average HVAC-related job values in our planning range often land around $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH}. One recovered emergency often covers months of answering.`,
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
          `A single after-hours emergency often runs $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH} for HVAC, plumbing, and similar trades. That one job can cover months of CallGrabbr.`,
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
        answer: `Usually yes if you take emergency work. One missed job at $${AVG_JOB_VALUE_LOW}–$${AVG_JOB_VALUE_HIGH} often exceeds several months of AI answering.`,
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
