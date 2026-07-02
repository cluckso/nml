/**
 * Analytics helpers. Uses Meta Pixel (fbq) and Roku Pixel (rkp) when available.
 * Call from client components after key actions.
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
    rkp?: (...args: unknown[]) => void
  }
}

export function trackStartTrial(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "StartTrial")
  }
  if (typeof window !== "undefined" && window.rkp) {
    window.rkp("event", "START_TRIAL")
  }
}

/** Card-on-file trial — Stripe subscription with trial_period_days. */
export function trackCardTrialStart(planName?: string): void {
  trackStartTrial()
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", planName ? { content_name: planName } : undefined)
  }
}

export function trackPaidIntent(source?: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", source ? { content_name: source } : undefined)
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
  // Roku Pixel — purchase/subscription (fired when user goes to Stripe checkout)
  if (typeof window !== "undefined" && window.rkp) {
    window.rkp("event", "PURCHASE")
  }
}

/** Fired when Stripe checkout completes and the user lands on the purchase success page. */
export function trackPurchaseSuccess(planName?: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", planName ? { content_name: planName } : undefined)
  }
}
