import type { CampaignPost } from "@/lib/marketing/campaigns/types"

const SOFT_CTA =
  "\n\n—\nRunning a service business? More tips at callgrabbr.com · Free 7-day trial, no card."

const TRIAL_CTA =
  "\n\n—\nStop losing jobs to voicemail → callgrabbr.com/sign-up · 7-day free trial, no card."

/** Daily owner tips — educational, adjacent to missed calls, intake, and local service ops. */
export const OWNER_TIPS_POSTS: Record<string, CampaignPost> = {
  "tip-01-speed-to-lead": {
    id: "tip-01-speed-to-lead",
    industry: "general",
    format: "tip",
    title: "Day 1 — Speed to lead",
    slides: [{ headline: "Call back within 5 minutes", body: "Leads go cold fast. Same-hour callback wins jobs your competitor just missed." }],
    caption: `Trade tip #1: Speed beats polish on the first touch.

Homeowners and property managers often call 2–3 companies. The first helpful callback — not the fanciest website — gets the dispatch.

Set a shop rule: every missed call gets a callback attempt within 5 minutes during business hours.${SOFT_CTA}`,
    hashtags: ["SmallBusiness", "ContractorTips", "LeadGeneration", "CallGrabbr"],
  },

  "tip-02-voicemail-myth": {
    id: "tip-02-voicemail-myth",
    industry: "general",
    format: "tip",
    title: "Day 2 — Voicemail reality",
    slides: [{ headline: "Voicemail is not a safety net", body: "Most callers won't leave a message. They dial the next listing." }],
    caption: `Trade tip #2: Voicemail captures a small fraction of callers — often cited around 5–15%.

If you're on a roof or under a sink, voicemail feels like coverage. For the customer, it's often a dead end.

Live answer (or fast text-back) keeps the conversation alive.${SOFT_CTA}`,
    hashtags: ["MissedCalls", "LocalBusiness", "TradesLife", "CallGrabbr"],
  },

  "tip-03-after-hours": {
    id: "tip-03-after-hours",
    industry: "general",
    format: "tip",
    title: "Day 3 — After-hours value",
    slides: [{ headline: "After-hours calls are often your best jobs", body: "Emergencies pay premium rates — if you capture them." }],
    caption: `Trade tip #3: Night and weekend calls skew urgent — no heat, active leak, electrical smell.

Owners who only answer 9–5 leave high-intent work on the table. You don't need to be on the phone 24/7 yourself — you need a system that captures name, address, and urgency so you can decide when to roll a truck.${SOFT_CTA}`,
    hashtags: ["AfterHours", "HVAC", "Plumber", "CallGrabbr"],
  },

  "tip-04-intake-basics": {
    id: "tip-04-intake-basics",
    industry: "general",
    format: "tip",
    title: "Day 4 — What to capture",
    slides: [{ headline: "Four fields every intake should aim for", body: "Name · Callback number · What's wrong · Service address" }],
    caption: `Trade tip #4: Before you quote or dispatch, you need the same basics every time.

1. Caller name
2. Best callback number
3. Clear problem description (not just "something's wrong")
4. Service address

Urgency and preferred timing are bonuses. Consistent intake = faster quotes and fewer back-and-forth texts.${SOFT_CTA}`,
    hashtags: ["CustomerService", "FieldService", "CallGrabbr"],
  },

  "tip-05-gbp-reviews": {
    id: "tip-05-gbp-reviews",
    industry: "general",
    format: "tip",
    title: "Day 5 — Google reviews",
    slides: [{ headline: "Reply to every Google review within 24 hours", body: "Prospects read your responses, not just your star rating." }],
    caption: `Trade tip #5: Your Google Business Profile is often the first impression after a missed call search.

Reply to reviews within a day — thank happy customers, professionally address complaints.

Short, human replies signal you're an active, accountable shop.${SOFT_CTA}`,
    hashtags: ["GoogleBusiness", "LocalSEO", "Reputation", "CallGrabbr"],
  },

  "tip-06-peak-season": {
    id: "tip-06-peak-season",
    industry: "hvac",
    format: "tip",
    title: "Day 6 — Peak season phones",
    slides: [{ headline: "Plan your phone before peak season hits", body: "Call volume spikes when you're already buried in jobs." }],
    caption: `HVAC tip #6: Peak heat and cold weeks double ring volume while your techs are maxed out.

Before the rush: confirm forwarding, who gets lead texts, and after-hours rules. A bad phone week during peak season can cost more than a slow month in spring.${SOFT_CTA}`,
    hashtags: ["HVAC", "HVACLife", "PeakSeason", "CallGrabbr"],
  },

  "tip-07-ring-delay": {
    id: "tip-07-ring-delay",
    industry: "general",
    format: "tip",
    title: "Day 7 — Ring first or answer all?",
    slides: [{ headline: "Let your line ring if you want to answer first", body: "Forward unanswered calls — don't replace your cell on every ring." }],
    caption: `Trade tip #7: Many owners want the phone to ring on their cell for 15–20 seconds, then backup answers.

That's smart — you keep personal control when you're free, and you don't lose the call when you're not.

Check your carrier's conditional forwarding options.${SOFT_CTA}`,
    hashtags: ["PhoneTips", "SmallBusinessOwner", "CallGrabbr"],
  },

  "tip-08-text-first": {
    id: "tip-08-text-first",
    industry: "general",
    format: "tip",
    title: "Day 8 — Text-back habit",
    slides: [{ headline: "Can't talk? Text in 60 seconds", body: '"Got your call — on a job, calling you back shortly."' }],
    caption: `Trade tip #8: A fast text beats silence.

Template: "Thanks for calling [Shop] — on a job site, will call you back within [X] minutes. Reply URGENT if this is an emergency."

Even a short text keeps you in the race while you're hands-on.${SOFT_CTA}`,
    hashtags: ["CustomerExperience", "TradesBusiness", "CallGrabbr"],
  },

  "tip-09-no-blind-quotes": {
    id: "tip-09-no-blind-quotes",
    industry: "general",
    format: "tip",
    title: "Day 9 — Don't quote blind",
    slides: [{ headline: "Big jobs need details before a number", body: "Price on the phone without scope = rework and margin loss." }],
    caption: `Trade tip #9: It's tempting to throw a range on the first call. For installs, replacements, and multi-trade work, under-quoting kills profit.

Capture scope and address first. Schedule an on-site or diagnostic when needed. Your intake script should gather facts — not promise a final price.${SOFT_CTA}`,
    hashtags: ["Pricing", "ContractorLife", "CallGrabbr"],
  },

  "tip-10-who-answers": {
    id: "tip-10-who-answers",
    industry: "general",
    format: "tip",
    title: "Day 10 — Who answers?",
    slides: [{ headline: "Assign phone ownership on the crew chart", body: "If everyone thinks someone else will pick up, nobody does." }],
    caption: `Trade tip #10: On teams of 3+, decide explicitly:

• Who answers during business hours?
• Who gets after-hours texts?
• Who dispatches emergencies?

Write it on the whiteboard. Confusion on the phone costs real jobs.${SOFT_CTA}`,
    hashtags: ["TeamManagement", "ServiceBusiness", "CallGrabbr"],
  },

  "tip-11-emergency-keywords": {
    id: "tip-11-emergency-keywords",
    industry: "general",
    format: "tip",
    title: "Day 11 — Flag emergencies early",
    slides: [{ headline: "Train intake to spot urgency words", body: "No heat · Active leak · Burning smell · Gas odor · Sparks" }],
    caption: `Trade tip #11: Emergencies need a different path than "quote next week."

Flag these on intake: no heat/AC, active flooding, sewage, burning smell, sparking, gas odor.

Sort urgent leads to the top of your callback list — not the bottom of voicemail.${SOFT_CTA}`,
    hashtags: ["EmergencyService", "Plumbing", "Electrical", "CallGrabbr"],
  },

  "tip-12-weekend-boundaries": {
    id: "tip-12-weekend-boundaries",
    industry: "general",
    format: "tip",
    title: "Day 12 — Weekend without burnout",
    slides: [{ headline: "Cover weekends without living on your phone", body: "Capture leads automatically; you choose which trucks roll." }],
    caption: `Trade tip #12: Weekend coverage doesn't mean you personally answer every ring.

A system that captures caller details lets you batch callbacks between family time — or dispatch only true emergencies.

Boundaries + coverage beats heroics + burnout.${SOFT_CTA}`,
    hashtags: ["WorkLifeBalance", "Contractor", "CallGrabbr"],
  },

  "tip-13-missed-call-audit": {
    id: "tip-13-missed-call-audit",
    industry: "general",
    format: "tip",
    title: "Day 13 — Weekly missed-call audit",
    slides: [{ headline: "Review missed calls every Monday", body: "10 minutes · How many? · Any become jobs? · Any go to competitors?" }],
    caption: `Trade tip #13: Pull your carrier or shop missed-call log once a week.

Ask: How many? Did we call back? Did any turn into booked work? Any we never returned?

What you measure on the phone, you fix on the phone.${SOFT_CTA}`,
    hashtags: ["BusinessOps", "KPIs", "CallGrabbr"],
  },

  "tip-14-callback-discipline": {
    id: "tip-14-callback-discipline",
    industry: "general",
    format: "tip",
    title: "Day 14 — Callback discipline",
    slides: [{ headline: "Same number, same day", body: "Call back from the number customers recognize — ideally before 5 PM." }],
    caption: `Trade tip #14: Customers ignore unknown numbers. Return calls from your main shop line when possible.

If you miss them once, a same-day second attempt is still worth it. After 24 hours, conversion drops hard.${SOFT_CTA}`,
    hashtags: ["SalesTips", "LocalBusiness", "CallGrabbr"],
  },

  "tip-15-service-area": {
    id: "tip-15-service-area",
    industry: "general",
    format: "tip",
    title: "Day 15 — Service area clarity",
    slides: [{ headline: "Confirm address before you dispatch", body: "Out-of-area jobs waste drive time and margin." }],
    caption: `Trade tip #15: Ask for the service address early — before you promise timing or pricing.

If you're not clear on towns you serve, say so on intake. A polite "we don't cover that zip" saves hours.${SOFT_CTA}`,
    hashtags: ["FieldService", "Dispatch", "CallGrabbr"],
  },

  "tip-16-plumbing-2am": {
    id: "tip-16-plumbing-2am",
    industry: "plumbing",
    format: "tip",
    title: "Day 16 — 2 AM leak mindset",
    slides: [{ headline: "Active drip = treat as urgent", body: "Ask: Is water still flowing? Can they shut off a valve?" }],
    caption: `Plumbing tip #16: Night calls need two quick safety questions:

• Is water actively flowing right now?
• Do they know where the shutoff is?

You get better intel before you roll a truck — and the homeowner feels heard.${SOFT_CTA}`,
    hashtags: ["Plumber", "PlumbingLife", "EmergencyPlumber", "CallGrabbr"],
  },

  "tip-17-electrical-safety": {
    id: "tip-17-electrical-safety",
    industry: "electrical",
    format: "tip",
    title: "Day 17 — Electrical safety first",
    slides: [{ headline: "Burning smell or sparks = priority", body: "Ask if they're safe. Tell them to leave the panel alone." }],
    caption: `Electrical tip #17: On intake, safety beats scheduling.

If they report sparks, burning smell, or shock — confirm they're safe, don't troubleshoot over the phone, prioritize callback.

Document urgency in your lead notes so dispatch sees it first.${SOFT_CTA}`,
    hashtags: ["Electrician", "ElectricalSafety", "CallGrabbr"],
  },

  "tip-18-auto-ymm": {
    id: "tip-18-auto-ymm",
    industry: "general",
    format: "tip",
    title: "Day 18 — Year, make, model",
    slides: [{ headline: "Shops: capture YMM + symptom", body: "Wrong parts and wrong bay time start with vague intake." }],
    caption: `Auto tip #18: Minimum viable intake for repair calls:

• Year, make, model
• What's it doing (or not doing)?
• Can they drive it in, or are they roadside?

That trio lets you slot the right bay and parts before they hang up.${SOFT_CTA}`,
    hashtags: ["AutoRepair", "MechanicLife", "CallGrabbr"],
  },

  "tip-19-review-timing": {
    id: "tip-19-review-timing",
    industry: "general",
    format: "tip",
    title: "Day 19 — Review timing",
    slides: [{ headline: "Ask for reviews after the job is done", body: "Not at the door with tools in hand — follow up by text next day." }],
    caption: `Trade tip #19: The best review ask is 12–24 hours after completion — when relief is fresh.

Keep it simple: "Glad we could help — if you have a minute, a Google review helps local folks find us."

Happy customers often will — they just need a nudge.${SOFT_CTA}`,
    hashtags: ["Reviews", "ReputationManagement", "CallGrabbr"],
  },

  "tip-20-gbp-hours": {
    id: "tip-20-gbp-hours",
    industry: "general",
    format: "tip",
    title: "Day 20 — GBP hours accuracy",
    slides: [{ headline: "Wrong hours = missed trust", body: "Update Google Business hours for holidays and summer Fridays." }],
    caption: `Trade tip #20: Customers check hours before they call. Outdated Google hours frustrate people who drove across town.

Set a quarterly reminder: verify hours, holiday closures, and "open now" status.

Accuracy is free marketing.${SOFT_CTA}`,
    hashtags: ["GoogleBusinessProfile", "LocalSEO", "CallGrabbr"],
  },

  "tip-21-competitor-speed": {
    id: "tip-21-competitor-speed",
    industry: "general",
    format: "tip",
    title: "Day 21 — Competitor reality",
    slides: [{ headline: "You're racing the next listing", body: "Not perfection — whoever responds first with confidence." }],
    caption: `Trade tip #21: Your competitor isn't necessarily better — they might just be faster on the phone.

Speed + clear next step ("I'll call you back in 10" or "tech en route window") wins more than a perfect pitch.${TRIAL_CTA}`,
    hashtags: ["CompetitiveAdvantage", "MissedCalls", "CallGrabbr"],
  },

  "tip-22-hold-music": {
    id: "tip-22-hold-music",
    industry: "general",
    format: "tip",
    title: "Day 22 — Hold music hurts",
    slides: [{ headline: "Long hold = hang-up", body: "Customers want answers, not loops." }],
    caption: `Trade tip #22: If callers hit hold music or phone trees, many bail.

Local service businesses win with a human (or human-sounding) greeting and quick questions — not "press 1 for sales."

Every extra 30 seconds is another chance to lose the job.${SOFT_CTA}`,
    hashtags: ["CustomerService", "CallGrabbr"],
  },

  "tip-23-batch-callbacks": {
    id: "tip-23-batch-callbacks",
    industry: "general",
    format: "tip",
    title: "Day 23 — Batch callbacks",
    slides: [{ headline: "Between jobs, return 3 calls at once", body: "Block 15 minutes after each dispatch for phone time." }],
    caption: `Trade tip #23: Constant phone interruptions on site kill productivity.

Try batching: after you finish a job or hit a natural break, return all pending leads in one 15-minute window.

Faster for you, still same-day for them.${SOFT_CTA}`,
    hashtags: ["Productivity", "ContractorTips", "CallGrabbr"],
  },

  "tip-24-dont-promise": {
    id: "tip-24-dont-promise",
    industry: "general",
    format: "tip",
    title: "Day 24 — What not to promise",
    slides: [{ headline: "Intake captures — it doesn't commit", body: "No exact arrival times or prices unless you're sure." }],
    caption: `Trade tip #24: Front-desk (or call assistant) should avoid:

• Guaranteed arrival times
• Firm pricing without seeing the job
• "We'll definitely be there today" without dispatch sign-off

Set expectations: "Someone will call you back shortly with next steps."${SOFT_CTA}`,
    hashtags: ["Operations", "ServiceBusiness", "CallGrabbr"],
  },

  "tip-25-seasonal-prep": {
    id: "tip-25-seasonal-prep",
    industry: "general",
    format: "tip",
    title: "Day 25 — Seasonal prep",
    slides: [{ headline: "Two weeks before busy season", body: "Test forwarding · Update greeting · Confirm who gets lead texts" }],
    caption: `Trade tip #25: Seasonal rushes expose weak phones before weak marketing.

Two weeks before your busy stretch: test a forwarded call end-to-end, update voicemail greeting dates, and confirm lead texts hit the right person.

Systems beat panic.${SOFT_CTA}`,
    hashtags: ["SeasonalBusiness", "HVAC", "CallGrabbr"],
  },

  "tip-26-one-greeting": {
    id: "tip-26-one-greeting",
    industry: "general",
    format: "tip",
    title: "Day 26 — One voicemail greeting",
    slides: [{ headline: "Update your voicemail monthly", body: "Mention callback window · Alternate number · Holiday closures" }],
    caption: `Trade tip #26: Stale voicemail messages confuse people.

Record a fresh greeting monthly: shop name, callback window, and emergency instructions.

If you forward to backup answering, make sure the carrier path actually works — test it yourself.${SOFT_CTA}`,
    hashtags: ["PhoneEtiquette", "SmallBusiness", "CallGrabbr"],
  },

  "tip-27-lead-definition": {
    id: "tip-27-lead-definition",
    industry: "general",
    format: "tip",
    title: "Day 27 — Define a lead",
    slides: [{ headline: "A lead = name + phone + real job", body: "Wrong numbers and vendor spam don't count." }],
    caption: `Trade tip #27: Track leads honestly.

Count: name, callback number, and a real service request.

Don't inflate numbers with robocalls, suppliers, or "how much do you charge for everything" tire-kickers with no address.

Clean metrics = better decisions.${SOFT_CTA}`,
    hashtags: ["Metrics", "LeadGeneration", "CallGrabbr"],
  },

  "tip-28-auto-ack-text": {
    id: "tip-28-auto-ack-text",
    industry: "general",
    format: "tip",
    title: "Day 28 — Auto-acknowledge",
    slides: [{ headline: "Instant text: 'We got your message'", body: "Buys you time without losing the customer." }],
    caption: `Trade tip #28: An immediate acknowledgment text — even before a full callback — reduces hang-ups and bad reviews.

"We received your request and will call shortly" is enough.

Silence makes people call the next company.${TRIAL_CTA}`,
    hashtags: ["SMS", "CustomerExperience", "CallGrabbr"],
  },

  "tip-29-hire-vs-forward": {
    id: "tip-29-hire-vs-forward",
    industry: "general",
    format: "tip",
    title: "Day 29 — Hire vs forward",
    slides: [{ headline: "Reception at ~30+ calls/day", body: "Below that, smart forwarding + lead capture often wins." }],
    caption: `Trade tip #29: Hiring front desk makes sense at steady high volume — often 30+ inbound calls per day.

Below that, many shops do better forwarding unanswered calls and getting structured lead texts.

Run your numbers: salary + benefits vs captured jobs from better phone coverage.${SOFT_CTA}`,
    hashtags: ["BusinessGrowth", "Hiring", "CallGrabbr"],
  },

  "tip-30-systems-beat-heroics": {
    id: "tip-30-systems-beat-heroics",
    industry: "general",
    format: "tip",
    title: "Day 30 — Systems beat heroics",
    slides: [{ headline: "You can't personally answer every ring", body: "Build a phone system that works when you're on the job." }],
    caption: `Trade tip #30: The best owners aren't phone heroes — they have phone systems.

Forward when you're busy. Capture details. Callback in batches. Flag emergencies. Measure missed calls weekly.

That's how you grow without missing the work that pays the bills.${TRIAL_CTA}`,
    hashtags: ["ContractorLife", "Systems", "CallGrabbr"],
    boost: true,
  },
}

export function getOwnerTipsPost(id: string): CampaignPost {
  const post = OWNER_TIPS_POSTS[id]
  if (!post) throw new Error(`Unknown owner-tips post: ${id}`)
  return post
}
