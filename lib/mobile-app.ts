/** Android mobile app metadata for marketing and store links. */

export const ANDROID_PACKAGE_ID = "com.me.adhd"

export const GOOGLE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`

export type MobileScreenshot = {
  src: string
  alt: string
  label: string
}

const screenshot = (name: string) => `/marketing/mobile-screenshots/${name}.png`

/** Play Store listing screenshots (9:19.5 phone aspect). */
export const MOBILE_SCREENSHOTS: MobileScreenshot[] = [
  {
    src: screenshot("dashboard-overview"),
    alt: "CallGrabbr mobile dashboard showing trial status, usage stats, and recent calls",
    label: "Dashboard",
  },
  {
    src: screenshot("calls"),
    alt: "CallGrabbr mobile calls list with search and emergency filter",
    label: "Calls",
  },
  {
    src: screenshot("settings"),
    alt: "CallGrabbr mobile settings with push notification toggles",
    label: "Settings",
  },
  {
    src: screenshot("billing"),
    alt: "CallGrabbr mobile billing view with plan and usage",
    label: "Billing",
  },
  {
    src: screenshot("trial-setup"),
    alt: "CallGrabbr mobile trial setup and onboarding progress",
    label: "Trial setup",
  },
]
