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
      "Plans start at $99/month (Solo Owner), $159/month (Mid Volume), and $279/month (High Volume). Each plan includes a monthly minute allowance; additional minutes are billed at $0.22/min.",
  },
]
