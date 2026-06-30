import type { CampaignPost } from "@/lib/marketing/campaigns/types"

/** Source-of-truth copy for the "Slave to Your Phone" campaign. */
export const PHONE_SLAVE_POSTS: Record<string, CampaignPost> = {
  "master-carousel": {
    id: "master-carousel",
    industry: "general",
    format: "carousel",
    title: "Slave to your phone — master carousel",
    boost: true,
    slides: [
      {
        headline: "You wanted to be your own boss.",
        body: "Now you're a slave to your phone.",
        sub: "Every ring = money or a lost job.",
      },
      {
        headline: "On the job. Phone rings.",
        body: "You can't answer.",
        sub: "They call the next name on Google.",
      },
      {
        headline: "Voicemail?",
        body: "Only 5–15% of callers leave one.",
        sub: "The rest hire your competitor.",
      },
      {
        headline: "CallGrabbr answers every call.",
        body: "Natural conversation. Not a robot menu.",
        sub: "Lead texted to you in seconds.",
      },
      {
        headline: "Get your freedom back.",
        body: "Try CallGrabbr free.",
        sub: "Setup in 5 minutes →",
      },
    ],
    caption: `You didn't start your business to stare at your phone all day.

Miss one call on a job site and you might lose a $500–$5,000 job to whoever picks up first.

CallGrabbr answers when you can't — name, phone, address, job details, urgency — texted to you in seconds.`,
    hashtags: [
      "CallGrabbr",
      "MissedCalls",
      "TradesBusiness",
      "SmallBusinessOwner",
      "ContractorLife",
    ],
  },

  "quote-general": {
    id: "quote-general",
    industry: "general",
    format: "quote",
    title: "Freedom quote",
    slides: [
      {
        headline: '"I started this business for freedom."',
        body: '"Now I can\'t put my phone down."',
        sub: "— Every trade owner",
      },
    ],
    caption: `Sound familiar?

You're on a ladder, under a sink, or driving between jobs — and the phone won't stop. Miss one call and you might lose a $1,000+ job to whoever picks up first.

CallGrabbr handles your calls with a real, helpful conversation. You get the lead by text in seconds. You stay focused on the work.`,
    hashtags: ["Contractor", "TradesLife", "MissedCalls", "CallGrabbr"],
  },

  "before-after-general": {
    id: "before-after-general",
    industry: "general",
    format: "before_after",
    title: "Before / After CallGrabbr",
    slides: [
      {
        headline: "Before CallGrabbr",
        body: "Phone rings 40x/day · Answer mid-job or lose the lead · Voicemail black hole · No real off time",
      },
      {
        headline: "After CallGrabbr",
        body: "Every call answered · Lead in your pocket in seconds · Focus on the work · Log off at 6",
      },
    ],
    caption: `One captured job pays for the month.

CallGrabbr answers when you can't. Try free — setup in 5 minutes.`,
    hashtags: ["SmallBusiness", "MissedCalls", "CallGrabbr"],
  },

  "stat-voicemail": {
    id: "stat-voicemail",
    industry: "general",
    format: "single",
    title: "Voicemail stat",
    slides: [{ headline: "80% won't leave voicemail.", body: "They call your competitor." }],
    caption: `Voicemail captures 5–15% of callers. The rest move on.

CallGrabbr captures 80–95%. One extra job pays for the month.`,
    hashtags: ["MissedCalls", "LocalBusiness", "CallGrabbr"],
  },

  "engagement-missed-jobs": {
    id: "engagement-missed-jobs",
    industry: "general",
    format: "engagement",
    title: "How many jobs did you miss?",
    caption: `Honest question for trade owners:

How many jobs did you lose last month because you couldn't answer the phone?

Even one = lost revenue. Drop your trade in the comments 👇`,
    hashtags: ["ContractorLife", "TradesBusiness", "CallGrabbr"],
  },

  "roi-calculator": {
    id: "roi-calculator",
    industry: "general",
    format: "single",
    title: "ROI calculator graphic",
    boost: true,
    slides: [
      { headline: "1 missed call", body: "= $500–$5,000 lost" },
      { headline: "CallGrabbr", body: "One extra job pays for the month" },
    ],
    caption: `Stop doing the math after you lose the job.

CallGrabbr answers every call and texts you the lead in seconds. Try free.`,
    hashtags: ["SmallBusinessOwner", "CallGrabbr", "MissedCalls"],
  },

  "tri-panel-trades": {
    id: "tri-panel-trades",
    industry: "general",
    format: "single",
    title: "HVAC · Plumbing · Electrical",
    slides: [
      {
        headline: "HVAC · Plumbing · Electrical",
        body: "We answer for all of you.",
        sub: "Industry-specific intake. Instant lead delivery.",
      },
    ],
    caption: `Built for trades — not tech companies.

HVAC, plumbing, electrical: CallGrabbr asks the right questions and texts you qualified leads in seconds.

Try free.`,
    hashtags: ["HVAC", "Plumber", "Electrician", "CallGrabbr"],
  },

  "hvac-carousel": {
    id: "hvac-carousel",
    industry: "hvac",
    format: "carousel",
    title: "HVAC carousel",
    boost: true,
    slides: [
      {
        headline: "You wanted to be your own boss.",
        body: "Now you're a slave to your phone.",
        sub: "Every ring = money or a lost job.",
      },
      {
        headline: "On a roof. AC dies. Phone rings.",
        body: "Customer needs heat tonight.",
        sub: "You can't climb down fast enough.",
      },
      {
        headline: "No-heat call at 9 PM?",
        body: "They call 3 HVAC companies.",
        sub: "First to answer gets the job.",
      },
      {
        headline: "CallGrabbr asks the right questions.",
        body: "System type. Address. Urgency.",
        sub: "You get a qualified lead by text.",
      },
      {
        headline: "Get your freedom back.",
        body: "Try CallGrabbr free.",
        sub: "Setup in 5 minutes →",
      },
    ],
    caption: `AC season hits different when your phone is the real boss.

On a roof. Under a house. Mid-install — and someone's furnace just died.

They won't leave voicemail. They'll call the next HVAC company on Google.

CallGrabbr answers every call, asks system type + address + urgency, and texts you a qualified lead in seconds.`,
    hashtags: ["HVAC", "HVACLife", "HeatingAndCooling", "MissedCalls", "CallGrabbr"],
  },

  "hvac-quote": {
    id: "hvac-quote",
    industry: "hvac",
    format: "quote",
    slides: [
      {
        headline: '"No heat in January."',
        body: '"Phone\'s in my truck."',
        sub: '"They called someone else." — HVAC owner',
      },
    ],
    caption: `No heat at 9 PM in January. You're finishing a job across town. Phone rings. You can't answer.

That customer just called your competitor. $800 job — gone.

CallGrabbr captures 80–95% of calls. Voicemail? 5–15%.`,
    hashtags: ["HVAC", "HVACContractor", "MissedCalls", "CallGrabbr"],
  },

  "hvac-before-after": {
    id: "hvac-before-after",
    industry: "hvac",
    format: "before_after",
    title: "HVAC before/after",
    slides: [
      {
        headline: "Before",
        body: "Lose no-heat calls while on install jobs",
      },
      {
        headline: "After",
        body: "Capture after-hours AC emergencies while you sleep",
      },
    ],
    caption: `HVAC is a phone game in disguise. CallGrabbr answers when you're on a roof. Try free.`,
    hashtags: ["HVAC", "ACRepair", "CallGrabbr"],
  },

  "hvac-no-heat": {
    id: "hvac-no-heat",
    industry: "hvac",
    format: "single",
    title: "No-heat emergency",
    caption: `No heat at 9 PM. You're on a job. They called your competitor.

CallGrabbr answers every HVAC emergency call and texts you the lead in seconds.`,
    hashtags: ["HVAC", "FurnaceRepair", "CallGrabbr"],
  },

  "hvac-reel": {
    id: "hvac-reel",
    industry: "hvac",
    format: "reel",
    title: "HVAC reel",
    overlays: [
      "AC season.",
      "Phone won't stop.",
      "You're in an attic.",
      "They call someone else.",
      "CallGrabbr answers.",
      "Lead in seconds.",
      "Try free.",
    ],
    caption: `Your phone shouldn't be your boss. Try CallGrabbr free — link in bio.`,
    hashtags: ["HVAC", "HVACLife", "CallGrabbr"],
  },

  "hvac-gbp": {
    id: "hvac-gbp",
    industry: "hvac",
    format: "google_business",
    title: "HVAC Google Business",
    googleBusiness: {
      headline: "HVAC: Stop Losing Emergency Calls",
      body: "Furnace out. AC dead. You're on a job and can't answer. They call the next company. CallGrabbr answers with a natural conversation, captures system details and urgency, texts you the lead instantly. Try free. Setup in 5 minutes.",
      cta: "Learn more",
    },
    caption: "",
  },

  "plumbing-carousel": {
    id: "plumbing-carousel",
    industry: "plumbing",
    format: "carousel",
    title: "Plumbing carousel",
    boost: true,
    slides: [
      {
        headline: "You wanted to be your own boss.",
        body: "Now you're a slave to your phone.",
        sub: "Every ring = money or a lost job.",
      },
      {
        headline: "Under a sink. Phone rings.",
        body: "Burst pipe upstairs.",
        sub: "You can't answer with wet hands.",
      },
      {
        headline: "Emergency leak?",
        body: "They call the next plumber.",
        sub: "Voicemail won't save the job.",
      },
      {
        headline: "CallGrabbr captures everything.",
        body: "Address. What's leaking. How urgent.",
        sub: "Qualified lead before you dry off.",
      },
      {
        headline: "Get your freedom back.",
        body: "Try CallGrabbr free.",
        sub: "Setup in 5 minutes →",
      },
    ],
    caption: `You started plumbing to run your own life. Now you're answering calls from crawl spaces with wet hands.

Burst pipe. Sewer backup. Water heater flood — they need someone NOW.

Miss the call. Lose the job. Simple as that.

CallGrabbr answers, gets address + what's wrong + how urgent, texts you in seconds.`,
    hashtags: ["Plumber", "PlumbingLife", "EmergencyPlumber", "CallGrabbr"],
  },

  "plumbing-quote": {
    id: "plumbing-quote",
    industry: "plumbing",
    format: "quote",
    slides: [
      {
        headline: '"Started plumbing to run my own schedule."',
        body: '"Now I answer calls in crawl spaces."',
        sub: "— Plumber",
      },
    ],
    caption: `Burst pipe upstairs. You're under the house. Phone rings. You can't answer.

By the time you call back, they've already booked another plumber.`,
    hashtags: ["Plumber", "PlumbingBusiness", "CallGrabbr"],
  },

  "plumbing-before-after": {
    id: "plumbing-before-after",
    industry: "plumbing",
    format: "before_after",
    slides: [
      { headline: "Before", body: "Miss burst-pipe calls in crawl spaces" },
      { headline: "After", body: "Get sewer backup details before you roll the truck" },
    ],
    caption: `Plumbing emergencies don't wait for voicemail. CallGrabbr answers first. Try free.`,
    hashtags: ["Plumber", "CallGrabbr"],
  },

  "plumbing-burst-pipe": {
    id: "plumbing-burst-pipe",
    industry: "plumbing",
    format: "single",
    title: "Burst pipe",
    caption: `Burst pipe. Wet hands. Phone rings. They move on.

CallGrabbr makes sure that next plumber isn't your competitor. Try free.`,
    hashtags: ["EmergencyPlumber", "PlumbingLife", "CallGrabbr"],
  },

  "plumbing-reel": {
    id: "plumbing-reel",
    industry: "plumbing",
    format: "reel",
    title: "Plumbing reel",
    overlays: [
      "Crawl space. Phone buzzes.",
      "Can't answer. Wet hands.",
      "They move on.",
      "CallGrabbr captures the job.",
      "Lead in your pocket.",
      "Try free.",
    ],
    caption: `Burst pipe call? We answer. You roll. Try free — link in bio.`,
    hashtags: ["Plumber", "PlumbingLife", "CallGrabbr"],
  },

  "plumbing-gbp": {
    id: "plumbing-gbp",
    industry: "plumbing",
    format: "google_business",
    title: "Plumbing Google Business",
    googleBusiness: {
      headline: "Plumbers: Capture Every Emergency Call",
      body: "Under a sink, in a crawl space, hands full — you can't always answer. CallGrabbr does. Natural conversation, address and urgency captured, lead texted in seconds. No robot menus. Try free today.",
      cta: "Learn more",
    },
    caption: "",
  },

  "electrical-carousel": {
    id: "electrical-carousel",
    industry: "electrical",
    format: "carousel",
    title: "Electrical carousel",
    boost: true,
    slides: [
      {
        headline: "You wanted to be your own boss.",
        body: "Now you're a slave to your phone.",
        sub: "Every ring = money or a lost job.",
      },
      {
        headline: "In a panel. Phone rings.",
        body: "Sparking outlet. No power.",
        sub: "You can't stop mid-job safely.",
      },
      {
        headline: "Electrical emergency?",
        body: "Safety issue. Zero patience.",
        sub: "They hire who answers first.",
      },
      {
        headline: "CallGrabbr qualifies the call.",
        body: "Address. Issue type. Urgency.",
        sub: "You decide before you pack up.",
      },
      {
        headline: "Get your freedom back.",
        body: "Try CallGrabbr free.",
        sub: "Setup in 5 minutes →",
      },
    ],
    caption: `You didn't become an electrician to be on call 24/7.

"No power" and "sparking outlet" calls don't wait — and you can't safely stop mid-panel to answer.

Miss the call. Lose a $400–$3,000 job.

CallGrabbr answers, qualifies the issue, captures address and urgency, texts you in seconds.`,
    hashtags: ["Electrician", "ElectricalContractor", "MissedCalls", "CallGrabbr"],
  },

  "electrical-quote": {
    id: "electrical-quote",
    industry: "electrical",
    format: "quote",
    slides: [
      {
        headline: '"Wanted freedom from the 9-to-5."',
        body: '"Now I\'m married to my phone and a live panel."',
        sub: "— Electrician",
      },
    ],
    caption: `You're in a live panel. Phone rings. You can't answer. You shouldn't answer.

They call the next electrician. Job gone.`,
    hashtags: ["Electrician", "MasterElectrician", "CallGrabbr"],
  },

  "electrical-before-after": {
    id: "electrical-before-after",
    industry: "electrical",
    format: "before_after",
    slides: [
      { headline: "Before", body: "Can't answer during live panel work" },
      { headline: "After", body: 'Qualify "no power" vs "new install" before callback' },
    ],
    caption: `Electrical work demands focus. Your phone demands attention. CallGrabbr bridges the gap. Try free.`,
    hashtags: ["Electrician", "CallGrabbr"],
  },

  "electrical-panel": {
    id: "electrical-panel",
    industry: "electrical",
    format: "single",
    title: "Live panel",
    caption: `Live panel. Phone won't quit. They hire who picks up.

CallGrabbr gets the lead while you work safely. Try free.`,
    hashtags: ["ElectricalContractor", "CallGrabbr"],
  },

  "electrical-reel": {
    id: "electrical-reel",
    industry: "electrical",
    format: "reel",
    title: "Electrical reel",
    overlays: [
      "Live panel. Focus mode.",
      "Phone won't quit.",
      "Safety first. Can't answer.",
      "They hire who picks up.",
      "CallGrabbr gets the lead.",
      "Try free.",
    ],
    caption: `No power call? Answered. Qualified. Texted. Try free — link in bio.`,
    hashtags: ["Electrician", "CallGrabbr"],
  },

  "electrical-gbp": {
    id: "electrical-gbp",
    industry: "electrical",
    format: "google_business",
    title: "Electrical Google Business",
    googleBusiness: {
      headline: "Electricians: Never Miss an Emergency Call",
      body: "In a panel, on a ladder, on another job — you can't always pick up. CallGrabbr answers with a professional conversation, captures issue type and address, delivers the lead by text in seconds. Try free. 5-minute setup.",
      cta: "Learn more",
    },
    caption: "",
  },

  "gbp-freedom": {
    id: "gbp-freedom",
    industry: "general",
    format: "google_business",
    title: "GBP — Freedom",
    googleBusiness: {
      headline: "Your phone shouldn't run your business",
      body: "You started for freedom — not to jump every time your phone rings. Miss one call and you lose a paying job. CallGrabbr answers with a natural conversation, captures the details, and texts you the lead in seconds. Try free. Setup in 5 minutes.",
      cta: "Learn more",
    },
    caption: "",
  },

  "gbp-roi": {
    id: "gbp-roi",
    industry: "general",
    format: "google_business",
    title: "GBP — ROI",
    googleBusiness: {
      headline: "One extra job pays for the whole month",
      body: "Voicemail? Most callers hang up and call your competitor. CallGrabbr captures 80–95% of calls — vs. 5–15% for voicemail. You stay on the job. We handle the phone. Try free.",
      cta: "Learn more",
    },
    caption: "",
  },

  "gbp-after-hours": {
    id: "gbp-after-hours",
    industry: "general",
    format: "google_business",
    title: "GBP — After hours",
    googleBusiness: {
      headline: "Freedom doesn't stop at 5 PM",
      body: "Emergency calls at 9 PM. Burst pipes on Sunday. You can't answer every ring — but your competitor will. CallGrabbr works after hours, weekends, and when you're on a job. Try free.",
      cta: "Learn more",
    },
    caption: "",
  },

  "gbp-trades": {
    id: "gbp-trades",
    industry: "general",
    format: "google_business",
    title: "GBP — Built for trades",
    googleBusiness: {
      headline: "Built for trades, not tech companies",
      body: "We ask the right questions — address, urgency, what's broken — so you know if it's worth a callback. No robot menus. No hold music. Try free.",
      cta: "Learn more",
    },
    caption: "",
  },

  "gbp-question": {
    id: "gbp-question",
    industry: "general",
    format: "google_business",
    title: "GBP — Question hook",
    googleBusiness: {
      headline: "How many jobs did you lose last month?",
      body: "If it's even one, CallGrabbr likely pays for itself. We answer when you can't and send you the lead in seconds. Try our AI free.",
      cta: "Learn more",
    },
    caption: "",
  },

  "linkedin-long-general": {
    id: "linkedin-long-general",
    industry: "general",
    format: "single",
    title: "LinkedIn — freedom story",
    caption: `You didn't become a contractor to be on call 24/7.

You wanted control. Flexibility. To build something yours.

Then the phone became the real boss.

Every ring on a job site is a decision: stop work and answer, or risk losing a $500–$5,000 job to whoever picks up first.

Most callers won't leave voicemail. They'll call the next name on Google.

CallGrabbr answers every call with a natural, professional conversation — captures name, phone, address, job details, and urgency — and delivers it to you by SMS/email in seconds.

No robot menus. No new software to learn. Setup in about 5 minutes.

If you capture one extra job a month, it pays for itself.`,
    hashtags: ["SmallBusiness", "Trades", "HVAC", "Plumbing", "Contractor"],
  },

  "linkedin-short-general": {
    id: "linkedin-short-general",
    industry: "general",
    format: "single",
    title: "LinkedIn — ROI one-liner",
    caption: `Freedom was the goal. Your phone is the reality.

Missed calls aren't "annoying" — they're lost revenue.

CallGrabbr: AI call answering built for local trades. 80–95% capture rate vs. 5–15% for voicemail.`,
    hashtags: ["LeadGeneration", "Trades"],
  },

  "linkedin-plumbing": {
    id: "linkedin-plumbing",
    industry: "plumbing",
    format: "single",
    title: "LinkedIn — plumbing",
    caption: `The hardest part of running a plumbing company isn't the pipes. It's the phone.

You're physically unable to answer during half your jobs. But emergency callers have zero patience.

CallGrabbr handles intake — address, issue, urgency — and delivers qualified leads by text in seconds.`,
    hashtags: ["Plumbing", "SmallBusiness"],
  },

  "linkedin-electrical": {
    id: "linkedin-electrical",
    industry: "electrical",
    format: "single",
    title: "LinkedIn — electrical",
    caption: `Electrical work demands focus. Your phone demands attention. Those two don't mix — and missed calls cost real money.

CallGrabbr qualifies emergencies (no power, sparking, outage scope) before you ever pick up the phone. You decide if it's worth rolling the truck.`,
    hashtags: ["Electrician", "Contractor"],
  },

  "x-hook-freedom": {
    id: "x-hook-freedom",
    industry: "general",
    format: "single",
    title: "X — freedom hook",
    caption: `You started your business to be your own boss. Now you're a slave to your phone. Every missed call = lost job. CallGrabbr answers when you can't.`,
  },

  "x-voicemail-stat": {
    id: "x-voicemail-stat",
    industry: "general",
    format: "single",
    title: "X — voicemail stat",
    caption: `Voicemail captures 5–15% of callers. The rest call your competitor. CallGrabbr captures 80–95%. One extra job pays for the month.`,
  },

  "x-after-hours": {
    id: "x-after-hours",
    industry: "general",
    format: "single",
    title: "X — after hours",
    caption: `Emergency call at 9 PM. You're off the clock. Your competitor isn't. CallGrabbr is.`,
  },

  "x-thread-general": {
    id: "x-thread-general",
    industry: "general",
    format: "thread",
    title: "X thread — campaign wrap",
    thread: [
      "You started your business to be your own boss. Now you're a slave to your phone.",
      "Voicemail captures 5–15% of callers. The rest call your competitor.",
      "On a ladder. Under a sink. Driving between jobs. Your phone rings. You can't answer. They don't wait.",
      "\"I can't miss a call — I'll lose the job.\" That's not freedom. That's a trap.",
      "CallGrabbr answers every call. Natural conversation. Lead texted in seconds. Try free.",
    ],
    caption: "",
  },

  "story-poll": {
    id: "story-poll",
    industry: "general",
    format: "story",
    title: "Story poll",
    overlays: [
      "Can you ignore your phone on a job?",
      "80% won't leave voicemail.",
      "They call your competitor.",
      "CallGrabbr answers. You get the lead.",
      "Try Free",
    ],
    caption: "",
  },

  "master-reel": {
    id: "master-reel",
    industry: "general",
    format: "reel",
    title: "Master reel",
    overlays: [
      "You wanted freedom.",
      "Your phone had other plans.",
      "Miss one call. Lose one job.",
      "They don't wait. They move on.",
      "CallGrabbr answers. Lead in seconds.",
      "Try free. Link in bio.",
    ],
    caption: `Your phone shouldn't be your boss. Try CallGrabbr free.`,
    hashtags: ["TradesBusiness", "CallGrabbr"],
  },

  "feature-checklist": {
    id: "feature-checklist",
    industry: "general",
    format: "single",
    title: "What CallGrabbr captures",
    slides: [
      {
        headline: "Every lead includes:",
        body: "✓ Name · ✓ Phone · ✓ Address · ✓ Job details · ✓ Urgency",
      },
    ],
    caption: `No robot menus. No hold music. Just a helpful call that sounds like your shop cares.

Try CallGrabbr free.`,
    hashtags: ["CallGrabbr", "LeadCapture"],
  },
}

export function getPhoneSlavePost(id: string): CampaignPost {
  const post = PHONE_SLAVE_POSTS[id]
  if (!post) throw new Error(`Unknown campaign post: ${id}`)
  return post
}
