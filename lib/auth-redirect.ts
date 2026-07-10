/** Same-origin app URL for Supabase email links (confirmation, password reset). */
export function getAppOrigin(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") return window.location.origin
  return ""
}

/** After email confirmation, send users to sign in — not trial signup or dashboard. */
export function getEmailConfirmRedirectUrl(): string {
  const origin = getAppOrigin()
  const path = "/sign-in?message=email-confirmed"
  return origin ? `${origin}${path}` : path
}
