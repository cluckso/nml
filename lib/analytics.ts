/**
 * Analytics helpers. Uses Meta Pixel (fbq) when available.
 * Call from client components after key actions.
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
  }
}

export function trackStartTrial(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "StartTrial")
  }
}

export function trackCompleteRegistration(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "CompleteRegistration")
  }
}

export function trackSubscribe(planName?: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Subscribe", planName ? { content_name: planName } : undefined)
  }
}
