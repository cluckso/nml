import type { CampaignPost } from "@/lib/marketing/campaigns/types"

const SOFT_CTA =
  "\n\n—\nKeep every opportunity moving with CallGrabbr · callgrabbr.com · Free 7-day trial, no card."

const TRIAL_CTA =
  "\n\n—\nStop losing jobs to missed calls and voicemail → callgrabbr.com/sign-up · Free 7-day trial, no card."

/**
 * Daily owner tips designed to educate while reinforcing CallGrabbr's core value:
 * every caller gets a natural answer, key details are captured, and the owner stays in control.
 */
export const OWNER_TIPS_POSTS: Record<string, CampaignPost> = {
  "tip-01-speed-to-lead": {
    id: "tip-01-speed-to-lead",
    industry: "general",
    format: "tip",
    title: "Day 1 — Speed to lead",
    slides: [{ headline: "The first real response has the advantage", body: "Answer now. Capture the job. Follow up with context." }],
    caption: `Trade tip #1: Customers rarely stop after one unanswered call.

The faster they reach a real conversation, the less reason they have to call the next company. Your first response does not need to solve the job — it needs to acknowledge the customer, capture the request, and set a clear next step.

CallGrabbr handles that first conversation while you stay focused on the work in front of you.${SOFT_CTA}`,
    hashtags: ["SmallBusiness", "ContractorTips", "LeadGeneration", "CallGrabbr"],
  },

  "tip-02-voicemail-myth": {
    id: "tip-02-voicemail-myth",
    industry: "general",
    format: "tip",
    title: "Day 2 — Voicemail reality",
    slides: [{ headline: "Voicemail is not a conversation", body: "Give callers an answer, not a tone." }],
    caption: `Trade tip #2: Voicemail asks the customer to do more work after you were unavailable.

A live, natural conversation keeps the caller engaged and gives you useful information: who they are, what they need, where the job is, and how urgent it sounds.

CallGrabbr replaces the dead end with a captured lead and an instant summary.${TRIAL_CTA}`,
    hashtags: ["MissedCalls", "LocalBusiness", "TradesLife", "CallGrabbr"],
  },

  "tip-03-after-hours": {
    id: "tip-03-after-hours",
    industry: "general",
    format: "tip",
    title: "Day 3 — After-hours value",
    slides: [{ headline: "Your business can answer after you clock out", body: "Capture urgent jobs without living on your phone." }],
    caption: `Trade tip #3: Nights and weekends often bring high-intent calls — no heat, active leaks, electrical concerns, lockouts, and breakdowns.

You do not need to personally answer every ring. You need a reliable intake system that captures the details and lets you decide what deserves an immediate response.

CallGrabbr answers, qualifies, and texts you the lead so you stay in control.${SOFT_CTA}`,
    hashtags: ["AfterHours", "HVAC", "Plumber", "CallGrabbr"],
  },

  "tip-04-intake-basics": {
    id: "tip-04-intake-basics",
    industry: "general",
    format: "tip",
    title: "Day 4 — What to capture",
    slides: [{ headline: "Four details turn a call into a usable lead", body: "Name · Callback number · Job details · Service address" }],
    caption: `Trade tip #4: A ringing phone is not yet a usable lead.

A solid intake should capture:

1. Caller name
2. Best callback number
3. Clear description of the problem
4. Service address

Add urgency and preferred timing, and you can follow up prepared instead of starting the conversation over. That is exactly what CallGrabbr is built to collect.${SOFT_CTA}`,
    hashtags: ["CustomerService", "FieldService", "CallGrabbr"],
  },

  "tip-05-gbp-reviews": {
    id: "tip-05-gbp-reviews",
    industry: "general",
    format: "tip",
    title: "Day 5 — Google reviews",
    slides: [{ headline: "Great marketing still needs someone to answer", body: "Do not pay for attention and send it to voicemail." }],
    caption: `Trade tip #5: Reviews help customers choose who to call. Your phone experience helps them decide who to hire.

A strong Google profile can create the opportunity, but an unanswered call can still send that customer elsewhere. Make sure the experience after the click is as reliable as the reputation that earned it.

CallGrabbr helps turn that hard-earned visibility into captured opportunities.${SOFT_CTA}`,
    hashtags: ["GoogleBusiness", "LocalSEO", "Reputation", "CallGrabbr"],
  },

  "tip-06-peak-season": {
    id: "tip-06-peak-season",
    industry: "hvac",
    format: "tip",
    title: "Day 6 — Peak season phones",
    slides: [{ headline: "Busy season exposes weak phone coverage", body: "More calls arrive when your team is least available." }],
    caption: `HVAC tip #6: Peak weather creates the exact problem most shops struggle with — more calls while every technician is already busy.

Before the rush, test your forwarding, confirm who receives lead alerts, and decide whether CallGrabbr answers every call or only the calls you cannot take.

The goal is simple: high call volume should create more booked work, not more missed opportunities.${TRIAL_CTA}`,
    hashtags: ["HVAC", "HVACLife", "PeakSeason", "CallGrabbr"],
  },

  "tip-07-ring-delay": {
    id: "tip-07-ring-delay",
    industry: "general",
    format: "tip",
    title: "Day 7 — Ring first or answer all?",
    slides: [{ headline: "Choose how CallGrabbr answers", body: "Every call, or only when you do not pick up." }],
    caption: `Trade tip #7: Phone coverage should fit the way you already work.

Prefer to answer when you are available? Let your business line ring first, then forward unanswered calls to CallGrabbr. Want complete coverage from the first ring? Route every call directly to the AI receptionist.

Either way, you keep control without sending callers to voicemail.${TRIAL_CTA}`,
    hashtags: ["PhoneTips", "SmallBusinessOwner", "CallGrabbr"],
  },

  "tip-08-text-first": {
    id: "tip-08-text-first",
    industry: "general",
    format: "tip",
    title: "Day 8 — Context before callback",
    slides: [{ headline: "Do not call back blind", body: "Know who called, what they need, and how urgent it is." }],
    caption: `Trade tip #8: A missed-call alert tells you almost nothing.

A useful lead summary tells you who called, what happened, where the job is, and whether it sounds urgent. That lets you return the call with context — or decide that it can wait until your current job is finished.

CallGrabbr sends the captured details straight to your phone after the conversation ends.${SOFT_CTA}`,
    hashtags: ["CustomerExperience", "TradesBusiness", "CallGrabbr"],
  },

  "tip-09-no-blind-quotes": {
    id: "tip-09-no-blind-quotes",
    industry: "general",
    format: "tip",
    title: "Day 9 — Do not quote blind",
    slides: [{ headline: "Capture scope before discussing price", body: "Good intake protects your time and margin." }],
    caption: `Trade tip #9: The first call should gather facts, not force a final price.

For installs, replacements, repairs, and multi-step work, incomplete information leads to weak estimates and wasted trips. Capture the issue, address, urgency, and relevant details before you promise anything.

CallGrabbr handles intake without committing your business to pricing or arrival times.${SOFT_CTA}`,
    hashtags: ["Pricing", "ContractorLife", "CallGrabbr"],
  },

  "tip-10-who-answers": {
    id: "tip-10-who-answers",
    industry: "general",
    format: "tip",
    title: "Day 10 — One dependable first response",
    slides: [{ headline: "Do not make the crew race for the phone", body: "Let the team work while one system captures every caller." }],
    caption: `Trade tip #10: When every crew member feels responsible for the phone, every ring becomes an interruption.

Create one dependable first-response system. Let CallGrabbr answer and capture the lead, then route the summary to the right owner, dispatcher, or on-call person.

Your team should know who follows up — not who has to stop working and answer.${SOFT_CTA}`,
    hashtags: ["TeamManagement", "ServiceBusiness", "CallGrabbr"],
  },

  "tip-11-emergency-keywords": {
    id: "tip-11-emergency-keywords",
    industry: "general",
    format: "tip",
    title: "Day 11 — Flag urgency early",
    slides: [{ headline: "Urgent calls should look urgent", body: "No heat · Active leak · Burning smell · Gas odor · Sparks" }],
    caption: `Trade tip #11: Not every lead belongs in the same callback queue.

Your intake should identify urgency indicators such as active flooding, no heat in dangerous weather, sewage, sparks, burning smells, or a reported gas odor. The caller should be directed to emergency services when immediate danger is present.

CallGrabbr captures the caller's wording so you can recognize urgent jobs quickly and respond appropriately.${SOFT_CTA}`,
    hashtags: ["EmergencyService", "Plumbing", "Electrical", "CallGrabbr"],
  },

  "tip-12-weekend-boundaries": {
    id: "tip-12-weekend-boundaries",
    industry: "general",
    format: "tip",
    title: "Day 12 — Weekend without burnout",
    slides: [{ headline: "Coverage does not require constant availability", body: "Let calls get answered while you choose when to respond." }],
    caption: `Trade tip #12: Weekend coverage should protect revenue without taking over your life.

CallGrabbr can answer the caller, collect the job details, and send you the summary. You decide whether to respond immediately, dispatch an emergency, or follow up during your next callback window.

The customer gets an answer. You keep your boundaries.${TRIAL_CTA}`,
    hashtags: ["WorkLifeBalance", "Contractor", "CallGrabbr"],
  },

  "tip-13-missed-call-audit": {
    id: "tip-13-missed-call-audit",
    industry: "general",
    format: "tip",
    title: "Day 13 — Audit lost opportunities",
    slides: [{ headline: "Measure what happens when you cannot answer", body: "Missed calls · Captured leads · Booked jobs · Unqualified calls" }],
    caption: `Trade tip #13: Do not judge phone coverage by how busy the phone feels.

Track the outcomes: how many calls were answered, how many became qualified leads, how many were booked, and how many were spam or unrelated.

Structured CallGrabbr lead summaries make that review far more useful than a list of unknown missed numbers.${SOFT_CTA}`,
    hashtags: ["BusinessOps", "KPIs", "CallGrabbr"],
  },

  "tip-14-callback-discipline": {
    id: "tip-14-callback-discipline",
    industry: "general",
    format: "tip",
    title: "Day 14 — Better callbacks",
    slides: [{ headline: "Return the call with the details in front of you", body: "A prepared callback feels faster and more professional." }],
    caption: `Trade tip #14: The quality of the callback matters as much as the speed.

Before you dial, know the customer's name, service address, problem, and urgency. Open with their situation instead of asking them to repeat the entire call.

CallGrabbr gives you the context needed to make the follow-up feel like a continuation — not a restart.${SOFT_CTA}`,
    hashtags: ["SalesTips", "LocalBusiness", "CallGrabbr"],
  },

  "tip-15-service-area": {
    id: "tip-15-service-area",
    industry: "general",
    format: "tip",
    title: "Day 15 — Service area clarity",
    slides: [{ headline: "Capture the address before you dispatch", body: "Qualify location before it costs drive time." }],
    caption: `Trade tip #15: The service address should be part of every intake.

It helps you confirm the caller is inside your coverage area, estimate travel, assign the right technician, and avoid promising service somewhere you do not go.

CallGrabbr can collect the address during the first conversation so you receive a lead that is ready to evaluate.${SOFT_CTA}`,
    hashtags: ["FieldService", "Dispatch", "CallGrabbr"],
  },

  "tip-16-plumbing-2am": {
    id: "tip-16-plumbing-2am",
    industry: "plumbing",
    format: "tip",
    title: "Day 16 — 2 AM plumbing calls",
    slides: [{ headline: "Capture the situation before you roll", body: "Is water active? Where is the leak? What is the service address?" }],
    caption: `Plumbing tip #16: An after-hours plumbing call needs clear facts before you decide what happens next.

Capture whether water is actively flowing, where the issue is located, whether the caller has taken any safe steps, and the exact service address. Avoid remote troubleshooting that could create additional risk.

CallGrabbr gathers the caller's description so you can judge urgency before leaving home.${SOFT_CTA}`,
    hashtags: ["Plumber", "PlumbingLife", "EmergencyPlumber", "CallGrabbr"],
  },

  "tip-17-electrical-safety": {
    id: "tip-17-electrical-safety",
    industry: "electrical",
    format: "tip",
    title: "Day 17 — Electrical safety first",
    slides: [{ headline: "Capture danger signs clearly", body: "Sparks · Smoke · Burning smell · Shock · Power loss" }],
    caption: `Electrical tip #17: Safety comes before scheduling.

When a caller reports sparks, smoke, a burning smell, shock, or another immediate danger, they should avoid the hazard and contact emergency services when appropriate. Your intake should document exactly what they reported without attempting risky remote diagnosis.

CallGrabbr gives you a clear summary so urgent electrical calls stand out immediately.${SOFT_CTA}`,
    hashtags: ["Electrician", "ElectricalSafety", "CallGrabbr"],
  },

  "tip-18-auto-ymm": {
    id: "tip-18-auto-ymm",
    industry: "auto",
    format: "tip",
    title: "Day 18 — Year, make, model",
    slides: [{ headline: "Better auto intake starts with YMM + symptom", body: "Know the vehicle before you schedule the bay." }],
    caption: `Auto shop tip #18: A useful repair lead should include:

• Year, make, and model
• What the vehicle is doing — or not doing
• Whether it can be driven or needs a tow
• The customer's preferred timing

CallGrabbr can collect those details before you call back, helping you schedule the right bay and ask better follow-up questions.${SOFT_CTA}`,
    hashtags: ["AutoRepair", "MechanicLife", "CallGrabbr"],
  },

  "tip-19-review-timing": {
    id: "tip-19-review-timing",
    industry: "general",
    format: "tip",
    title: "Day 19 — Reviews start with the first call",
    slides: [{ headline: "Customer experience begins before the job", body: "A professional first answer builds confidence." }],
    caption: `Trade tip #19: Reviews are influenced by more than the finished repair.

Customers remember whether someone answered, whether they felt heard, and whether the next step was clear. A professional intake experience builds confidence before a technician ever arrives.

CallGrabbr helps your business make that first interaction consistent, even when nobody on the crew can pick up.${SOFT_CTA}`,
    hashtags: ["Reviews", "ReputationManagement", "CallGrabbr"],
  },

  "tip-20-gbp-hours": {
    id: "tip-20-gbp-hours",
    industry: "general",
    format: "tip",
    title: "Day 20 — Hours and phone coverage",
    slides: [{ headline: "Closed does not have to mean unreachable", body: "Keep after-hours callers from reaching a dead end." }],
    caption: `Trade tip #20: Keep your Google Business hours accurate — then decide what callers experience outside those hours.

You may be closed for regular service while still wanting to capture tomorrow's work or identify a true emergency. CallGrabbr can answer after hours, explain the next step, and collect the lead for follow-up.

Clear hours plus reliable call coverage creates better expectations.${SOFT_CTA}`,
    hashtags: ["GoogleBusinessProfile", "LocalSEO", "CallGrabbr"],
  },

  "tip-21-competitor-speed": {
    id: "tip-21-competitor-speed",
    industry: "general",
    format: "tip",
    title: "Day 21 — Competitor reality",
    slides: [{ headline: "The next listing is one tap away", body: "Give callers a reason to stop searching." }],
    caption: `Trade tip #21: Your competitor does not have to be better to win the job. They may simply be the first business that answers and sounds ready to help.

A natural greeting, a few relevant questions, and a clear next step can keep the customer from continuing down the search results.

CallGrabbr makes sure an unavailable owner does not become an unavailable business.${TRIAL_CTA}`,
    hashtags: ["CompetitiveAdvantage", "MissedCalls", "CallGrabbr"],
  },

  "tip-22-hold-music": {
    id: "tip-22-hold-music",
    industry: "general",
    format: "tip",
    title: "Day 22 — Skip the phone maze",
    slides: [{ headline: "Customers called for help, not a menu", body: "Use a natural conversation instead of a phone tree." }],
    caption: `Trade tip #22: Local service callers usually have one goal — explain the problem and find out what happens next.

Long menus, repeated transfers, and hold loops add friction before the relationship even starts. A direct, natural conversation is a better fit for a local business.

CallGrabbr asks the questions your business needs without making callers navigate a robotic menu.${TRIAL_CTA}`,
    hashtags: ["CustomerService", "CallGrabbr"],
  },

  "tip-23-batch-callbacks": {
    id: "tip-23-batch-callbacks",
    industry: "general",
    format: "tip",
    title: "Day 23 — Protect productive time",
    slides: [{ headline: "Stop letting every ring interrupt the job", body: "Capture calls now. Return qualified leads at the right moment." }],
    caption: `Trade tip #23: Constant phone interruptions slow the work, frustrate the customer in front of you, and increase mistakes.

Let CallGrabbr handle the first conversation while you finish the task safely. Then review the lead summaries and return the qualified calls during your next natural break.

The caller gets answered immediately. You regain control of your schedule.${TRIAL_CTA}`,
    hashtags: ["Productivity", "ContractorTips", "CallGrabbr"],
  },

  "tip-24-dont-promise": {
    id: "tip-24-dont-promise",
    industry: "general",
    format: "tip",
    title: "Day 24 — Intake without overpromising",
    slides: [{ headline: "Capture the request — do not commit the schedule", body: "No firm price or arrival time without your approval." }],
    caption: `Trade tip #24: A good receptionist gathers information and sets expectations without making promises the field team cannot keep.

Avoid guaranteed arrival times, final pricing without proper scope, or claims that a technician will definitely arrive the same day.

CallGrabbr is designed to capture the lead and communicate the next step while leaving pricing, scheduling, and dispatch decisions with you.${SOFT_CTA}`,
    hashtags: ["Operations", "ServiceBusiness", "CallGrabbr"],
  },

  "tip-25-seasonal-prep": {
    id: "tip-25-seasonal-prep",
    industry: "general",
    format: "tip",
    title: "Day 25 — Seasonal prep",
    slides: [{ headline: "Test your call flow before the rush", body: "Forwarding · Greeting · Lead alerts · After-hours rules" }],
    caption: `Trade tip #25: Busy season is the wrong time to discover that calls are forwarding incorrectly or alerts are going to the wrong person.

Before demand rises, place a full test call. Confirm the greeting, verify the right questions are being asked, and make sure the summary reaches the correct phone and email.

CallGrabbr should feel invisible to your workflow — until it saves a job you would have missed.${SOFT_CTA}`,
    hashtags: ["SeasonalBusiness", "HVAC", "CallGrabbr"],
  },

  "tip-26-one-greeting": {
    id: "tip-26-one-greeting",
    industry: "general",
    format: "tip",
    title: "Day 26 — Make the greeting sound like your business",
    slides: [{ headline: "Your first answer should match your brand", body: "Business name · Services · Tone · Next step" }],
    caption: `Trade tip #26: The first few seconds of a call shape how professional your business feels.

Use a greeting that clearly identifies the company, sounds natural, and moves quickly into the caller's reason for calling. Avoid generic scripts that could belong to any business.

Customize CallGrabbr so the AI receptionist represents your shop — not a faceless call center.${SOFT_CTA}`,
    hashtags: ["PhoneEtiquette", "SmallBusiness", "CallGrabbr"],
  },

  "tip-27-lead-definition": {
    id: "tip-27-lead-definition",
    industry: "general",
    format: "tip",
    title: "Day 27 — Define a qualified lead",
    slides: [{ headline: "A ring is not a lead", body: "Name + contact + real service need + usable details" }],
    caption: `Trade tip #27: Track real opportunities, not raw call volume.

A qualified lead should include a reachable person, a genuine service request, and enough information to evaluate the job. Spam, vendors, wrong numbers, and unrelated calls should not inflate the number.

CallGrabbr helps separate useful opportunities from phone noise so your metrics reflect actual business potential.${SOFT_CTA}`,
    hashtags: ["Metrics", "LeadGeneration", "CallGrabbr"],
  },

  "tip-28-auto-ack-text": {
    id: "tip-28-auto-ack-text",
    industry: "general",
    format: "tip",
    title: "Day 28 — Instant owner notification",
    slides: [{ headline: "The caller talks. You get the summary.", body: "No voicemail playback. No mystery number. No lost details." }],
    caption: `Trade tip #28: The best notification is not “you missed a call.”

It is a structured summary with the caller's name, callback number, address, job details, and urgency. That gives you enough information to prioritize the lead without replaying voicemail or returning every unknown number.

CallGrabbr sends the information directly to you as soon as the call ends.${TRIAL_CTA}`,
    hashtags: ["SMS", "CustomerExperience", "CallGrabbr"],
  },

  "tip-29-hire-vs-forward": {
    id: "tip-29-hire-vs-forward",
    industry: "general",
    format: "tip",
    title: "Day 29 — Add coverage before overhead",
    slides: [{ headline: "You may need phone coverage — not another full-time employee", body: "Scale your answering capacity with your call volume." }],
    caption: `Trade tip #29: A full-time receptionist can be valuable, but many growing service businesses need reliable coverage before they need another full-time payroll commitment.

CallGrabbr can cover every call, overflow, after-hours traffic, or only the calls you miss. That gives you room to improve customer response without changing your entire staffing model.

Add the coverage you need now. Keep the option to hire when the broader role truly justifies it.${TRIAL_CTA}`,
    hashtags: ["BusinessGrowth", "Hiring", "CallGrabbr"],
  },

  "tip-30-systems-beat-heroics": {
    id: "tip-30-systems-beat-heroics",
    industry: "general",
    format: "tip",
    title: "Day 30 — Systems beat heroics",
    slides: [{ headline: "You should not have to choose between the job and the phone", body: "Let CallGrabbr answer while you keep working." }],
    caption: `Trade tip #30: Growth should not require the owner to personally catch every ring.

Build a system that answers consistently, captures the right details, flags urgency, sends the lead instantly, and leaves business decisions in your hands.

CallGrabbr helps you protect the work you already have without losing the next job that pays the bills.${TRIAL_CTA}`,
    hashtags: ["ContractorLife", "Systems", "CallGrabbr"],
    boost: true,
  },
}

export function getOwnerTipsPost(id: string): CampaignPost {
  const post = OWNER_TIPS_POSTS[id]
  if (!post) throw new Error(`Unknown owner-tips post: ${id}`)
  return post
}
