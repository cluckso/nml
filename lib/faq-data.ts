import type { FaqItem } from "@/lib/structured-data"

/** General product FAQ — used on Help page and FAQPage JSON-LD. */
export const PRODUCT_FAQ: FaqItem[] = [
  {
    question: "What is CallGrabbr?",
    answer:
      "CallGrabbr is a call answering service for local service businesses. When you miss a call, your call assistant picks up, collects lead details, and sends you a text or email summary—usually within seconds.",
  },
  {
    question: "Do I need to change my business phone number?",
    answer:
      "No. You keep your existing business number. Set up call forwarding from your carrier so unanswered calls route to your CallGrabbr number shown in your dashboard.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "You get a 7-day free trial with 40 included call minutes. No credit card is required to start. One trial per business phone number.",
  },
  {
    question: "What information does CallGrabbr capture from callers?",
    answer:
      "Typical lead details include caller name, callback number, reason for the call, service address, vehicle info (for auto shops), and appointment preferences—based on your industry and settings.",
  },
  {
    question: "Which industries does CallGrabbr support?",
    answer:
      "CallGrabbr is built for HVAC, plumbing, electrical, auto repair, handyman, cleaning, landscaping, and other local service businesses.",
  },
  {
    question: "Can CallGrabbr answer only when I miss a call?",
    answer:
      "Yes. In Settings → Call Routing you can answer all calls immediately or set a delay (seconds or rings) so your line rings first and CallGrabbr picks up when you don't.",
  },
  {
    question: "How much does CallGrabbr cost after the trial?",
    answer:
      "Solo Owner is $99/month (~100 captured calls) for missed and after-hours coverage. Mid Volume is $159/month (~265 calls) for shops that need most inbound calls answered. High Volume is $279/month (~500 calls) for busy multi-crew operations. Estimates assume ~3 minutes per call. Additional usage is $0.22/min. One captured job ($350–$600 average) often pays for months of service.",
  },
  {
    question: "Which plan should I choose?",
    answer:
      "Start with Solo Owner if you're a one-truck shop and mainly need missed and after-hours calls covered while you're on a job. Choose Mid Volume when you want the AI to answer most inbound calls like a 24/7 front desk. High Volume fits busy shops with multiple crews or departments. Upgrade anytime as volume grows.",
  },
  {
    question: "Is CallGrabbr worth $99/month?",
    answer:
      "For most service businesses, yes — if it captures even one job you'd have lost to voicemail. Average job value is $350–$600. Solo Owner costs $99/month (~$0.99 per captured call at included volume). That's far less than a human answering service ($235+/month) and much cheaper than one missed emergency call.",
  },
]
