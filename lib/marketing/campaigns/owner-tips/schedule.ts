import type { ScheduledEntry } from "@/lib/marketing/campaigns/types"

/** 30-day daily owner tips — educational, soft-sell. Times are America/New_York. */
export const OWNER_TIPS_SCHEDULE: ScheduledEntry[] = [
  { day: 1, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-01-speed-to-lead", time: "07:00" },
  { day: 1, platform: "linkedin", format: "tip", industry: "general", postId: "tip-01-speed-to-lead", time: "10:00" },

  { day: 2, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-02-voicemail-myth", time: "07:00" },
  { day: 2, platform: "twitter", format: "tip", industry: "general", postId: "tip-02-voicemail-myth", time: "12:00" },

  { day: 3, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-03-after-hours", time: "07:00" },

  { day: 4, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-04-intake-basics", time: "07:00" },
  { day: 4, platform: "google_business", format: "tip", industry: "general", postId: "tip-04-intake-basics", time: "09:00" },

  { day: 5, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-05-gbp-reviews", time: "07:00" },
  { day: 5, platform: "linkedin", format: "tip", industry: "general", postId: "tip-05-gbp-reviews", time: "10:00" },

  { day: 6, platform: ["facebook", "instagram"], format: "tip", industry: "hvac", postId: "tip-06-peak-season", time: "07:00" },

  { day: 7, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-07-ring-delay", time: "07:00" },
  { day: 7, platform: "twitter", format: "tip", industry: "general", postId: "tip-07-ring-delay", time: "12:00" },

  { day: 8, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-08-text-first", time: "07:00" },

  { day: 9, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-09-no-blind-quotes", time: "07:00" },

  { day: 10, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-10-who-answers", time: "07:00" },
  { day: 10, platform: "linkedin", format: "tip", industry: "general", postId: "tip-10-who-answers", time: "10:00" },
  { day: 10, platform: "google_business", format: "tip", industry: "general", postId: "tip-10-who-answers", time: "09:00" },

  { day: 11, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-11-emergency-keywords", time: "07:00" },

  { day: 12, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-12-weekend-boundaries", time: "07:00" },

  { day: 13, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-13-missed-call-audit", time: "07:00" },
  { day: 13, platform: "twitter", format: "tip", industry: "general", postId: "tip-13-missed-call-audit", time: "12:00" },

  { day: 14, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-14-callback-discipline", time: "07:00" },

  { day: 15, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-15-service-area", time: "07:00" },
  { day: 15, platform: "linkedin", format: "tip", industry: "general", postId: "tip-15-service-area", time: "10:00" },

  { day: 16, platform: ["facebook", "instagram"], format: "tip", industry: "plumbing", postId: "tip-16-plumbing-2am", time: "07:00" },

  { day: 17, platform: ["facebook", "instagram"], format: "tip", industry: "electrical", postId: "tip-17-electrical-safety", time: "07:00" },

  { day: 18, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-18-auto-ymm", time: "07:00" },
  { day: 18, platform: "google_business", format: "tip", industry: "general", postId: "tip-18-auto-ymm", time: "09:00" },

  { day: 19, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-19-review-timing", time: "07:00" },

  { day: 20, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-20-gbp-hours", time: "07:00" },
  { day: 20, platform: "twitter", format: "tip", industry: "general", postId: "tip-20-gbp-hours", time: "12:00" },

  { day: 21, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-21-competitor-speed", time: "07:00", notes: "Soft trial CTA in caption" },

  { day: 22, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-22-hold-music", time: "07:00" },
  { day: 22, platform: "linkedin", format: "tip", industry: "general", postId: "tip-22-hold-music", time: "10:00" },

  { day: 23, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-23-batch-callbacks", time: "07:00" },

  { day: 24, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-24-dont-promise", time: "07:00" },

  { day: 25, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-25-seasonal-prep", time: "07:00" },
  { day: 25, platform: "google_business", format: "tip", industry: "general", postId: "tip-25-seasonal-prep", time: "09:00" },

  { day: 26, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-26-one-greeting", time: "07:00" },

  { day: 27, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-27-lead-definition", time: "07:00" },
  { day: 27, platform: "twitter", format: "tip", industry: "general", postId: "tip-27-lead-definition", time: "12:00" },

  { day: 28, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-28-auto-ack-text", time: "07:00", notes: "Trial CTA in caption" },

  { day: 29, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-29-hire-vs-forward", time: "07:00" },
  { day: 29, platform: "linkedin", format: "tip", industry: "general", postId: "tip-29-hire-vs-forward", time: "10:00" },

  { day: 30, platform: ["facebook", "instagram"], format: "tip", industry: "general", postId: "tip-30-systems-beat-heroics", time: "07:00", notes: "Month wrap — boost" },
  { day: 30, platform: "google_business", format: "tip", industry: "general", postId: "tip-30-systems-beat-heroics", time: "09:00" },
]
