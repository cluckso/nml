import { getSafeRedirectPath } from "@/lib/safe-redirect"

/** Same-origin app URL for Supabase email links (confirmation, password reset). */
export function getAppOrigin(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") return window.location.origin
  return ""
}

/**
 * After email confirmation, land on sign-in so the client can exchange the code
 * and continue into setup. Optional `next` is preserved when allowlisted by Supabase
 * (query on redirect URL); sessionStorage is the reliable fallback.
 */
export function getEmailConfirmRedirectUrl(next?: string | null): string {
  const origin = getAppOrigin()
  const safeNext = getSafeRedirectPath(next)
  const params = new URLSearchParams()
  params.set("message", "email-confirmed")
  if (safeNext) params.set("next", safeNext)
  const path = `/sign-in?${params.toString()}`
  return origin ? `${origin}${path}` : path
}

/** Resolve post-auth destination: query → sessionStorage → default. */
export function resolvePostAuthRedirect(
  queryNext: string | null | undefined,
  storedNext: string | null | undefined,
  fallback = "/trial/start"
): string {
  return (
    getSafeRedirectPath(queryNext) ??
    getSafeRedirectPath(storedNext) ??
    fallback
  )
}
