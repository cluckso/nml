import type { ScheduledEntry } from "@/lib/marketing/campaigns/types"

/** 30-day posting schedule for the Phone Slave campaign. Times are local (America/New_York). */
export const PHONE_SLAVE_SCHEDULE: ScheduledEntry[] = [
  { day: 1, platform: ["facebook", "instagram"], format: "carousel", industry: "general", postId: "master-carousel", time: "07:00", notes: "Launch — boost" },
  { day: 1, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-freedom", time: "09:00" },
  { day: 1, platform: "twitter", format: "single", industry: "general", postId: "x-hook-freedom", time: "12:00" },

  { day: 2, platform: "instagram", format: "story", industry: "general", postId: "story-poll", time: "08:00" },
  { day: 2, platform: "linkedin", format: "single", industry: "general", postId: "linkedin-long-general", time: "10:00" },

  { day: 3, platform: ["facebook", "instagram"], format: "quote", industry: "hvac", postId: "hvac-quote", time: "07:00" },
  { day: 3, platform: "twitter", format: "single", industry: "hvac", postId: "hvac-no-heat", time: "12:00" },

  { day: 4, platform: "instagram", format: "reel", industry: "hvac", postId: "hvac-reel", time: "08:00", notes: "Cross-post to FB Reels" },
  { day: 4, platform: "google_business", format: "google_business", industry: "hvac", postId: "hvac-gbp", time: "09:00" },

  { day: 5, platform: "facebook", format: "before_after", industry: "hvac", postId: "hvac-before-after", time: "07:00" },
  { day: 5, platform: "twitter", format: "single", industry: "general", postId: "x-voicemail-stat", time: "12:00" },

  { day: 6, platform: "instagram", format: "story", industry: "hvac", postId: "hvac-no-heat", time: "08:00", notes: "Story: Can you ignore your phone on a roof?" },
  { day: 7, platform: ["facebook", "instagram"], format: "single", industry: "general", postId: "stat-voicemail", time: "07:00" },

  { day: 8, platform: ["facebook", "instagram"], format: "carousel", industry: "plumbing", postId: "plumbing-carousel", time: "07:00", notes: "Boost" },
  { day: 8, platform: "google_business", format: "google_business", industry: "plumbing", postId: "plumbing-gbp", time: "09:00" },

  { day: 9, platform: "linkedin", format: "single", industry: "plumbing", postId: "linkedin-plumbing", time: "10:00" },
  { day: 9, platform: "twitter", format: "single", industry: "plumbing", postId: "plumbing-burst-pipe", time: "12:00" },

  { day: 10, platform: "instagram", format: "reel", industry: "plumbing", postId: "plumbing-reel", time: "08:00" },

  { day: 11, platform: "facebook", format: "before_after", industry: "plumbing", postId: "plumbing-before-after", time: "07:00" },
  { day: 11, platform: "instagram", format: "story", industry: "plumbing", postId: "plumbing-burst-pipe", time: "08:00" },

  { day: 12, platform: ["facebook", "instagram"], format: "quote", industry: "plumbing", postId: "plumbing-quote", time: "07:00" },
  { day: 12, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-roi", time: "09:00" },

  { day: 13, platform: "twitter", format: "single", industry: "general", postId: "x-after-hours", time: "12:00" },

  { day: 14, platform: "facebook", format: "engagement", industry: "general", postId: "engagement-missed-jobs", time: "07:00" },

  { day: 15, platform: ["facebook", "instagram"], format: "carousel", industry: "electrical", postId: "electrical-carousel", time: "07:00", notes: "Boost" },
  { day: 15, platform: "google_business", format: "google_business", industry: "electrical", postId: "electrical-gbp", time: "09:00" },

  { day: 16, platform: "instagram", format: "reel", industry: "electrical", postId: "electrical-reel", time: "08:00" },
  { day: 16, platform: "linkedin", format: "single", industry: "electrical", postId: "linkedin-electrical", time: "10:00" },

  { day: 17, platform: ["facebook", "instagram"], format: "quote", industry: "electrical", postId: "electrical-quote", time: "07:00" },
  { day: 17, platform: "twitter", format: "single", industry: "electrical", postId: "electrical-panel", time: "12:00" },

  { day: 18, platform: "facebook", format: "before_after", industry: "electrical", postId: "electrical-before-after", time: "07:00" },
  { day: 18, platform: "instagram", format: "story", industry: "electrical", postId: "electrical-panel", time: "08:00" },

  { day: 19, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-after-hours", time: "09:00" },
  { day: 19, platform: "facebook", format: "single", industry: "general", postId: "feature-checklist", time: "07:00" },

  { day: 20, platform: "instagram", format: "reel", industry: "general", postId: "master-reel", time: "08:00" },
  { day: 21, platform: "linkedin", format: "single", industry: "general", postId: "linkedin-short-general", time: "10:00" },

  { day: 22, platform: ["facebook", "instagram"], format: "carousel", industry: "general", postId: "master-carousel", time: "07:00", notes: "Repost — boost" },
  { day: 22, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-trades", time: "09:00" },

  { day: 23, platform: "instagram", format: "story", industry: "general", postId: "master-reel", time: "08:00", notes: "Countdown: free trial" },
  { day: 23, platform: "twitter", format: "single", industry: "general", postId: "x-voicemail-stat", time: "12:00" },

  { day: 24, platform: "facebook", format: "single", industry: "hvac", postId: "hvac-no-heat", time: "07:00" },
  { day: 24, platform: "instagram", format: "reel", industry: "hvac", postId: "hvac-reel", time: "08:00" },

  { day: 25, platform: "facebook", format: "single", industry: "plumbing", postId: "plumbing-burst-pipe", time: "07:00" },
  { day: 25, platform: "linkedin", format: "single", industry: "general", postId: "linkedin-short-general", time: "10:00", notes: "Trial CTA push" },

  { day: 26, platform: ["facebook", "instagram"], format: "single", industry: "general", postId: "tri-panel-trades", time: "07:00" },
  { day: 26, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-question", time: "09:00" },

  { day: 27, platform: "instagram", format: "story", industry: "general", postId: "tri-panel-trades", time: "08:00", notes: "Rotate HVAC/plumbing/electrical one-liners" },

  { day: 28, platform: "twitter", format: "thread", industry: "general", postId: "x-thread-general", time: "12:00" },

  { day: 29, platform: ["facebook", "instagram"], format: "single", industry: "general", postId: "roi-calculator", time: "07:00", notes: "Boost" },
  { day: 29, platform: "google_business", format: "google_business", industry: "general", postId: "gbp-after-hours", time: "09:00" },

  { day: 30, platform: ["facebook", "instagram", "linkedin", "twitter"], format: "single", industry: "general", postId: "engagement-missed-jobs", time: "07:00", notes: "Final CTA push — all platforms" },
]
