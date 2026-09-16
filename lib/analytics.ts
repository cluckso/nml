/**
 * Analytics helpers. Uses Meta Pixel (fbq), Roku Pixel (rkp), and Spotify Ads (spdt) when available.
 * Call from client components after key actions.
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
    rkp?: (...args: unknown[]) => void
    spdt?: (...args: unknown[]) => void
  }
}

function trackSpotifyPurchase(value: number, currency = "USD"): void {
  if (typeof window !== "undefined" && window.spdt) {
    window.spdt("purchase", { value, currency })
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

function pixelParams(
  planName?: string,
  options?: { value?: number; currency?: string }
): Record<string, unknown> | undefined {
  const params: Record<string, unknown> = {}
  if (planName) params.content_name = planName
  if (options?.value != null) {
    params.value = options.value
    params.currency = options.currency ?? "USD"
  }
  return Object.keys(params).length > 0 ? params : undefined
}

/** Checkout click — intent, not payment. Do not fire Subscribe/Purchase here. */
export function trackInitiateCheckout(
  planName?: string,
  options?: { value?: number; currency?: string }
): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", pixelParams(planName, options))
  }
}

/** @deprecated Prefer trackInitiateCheckout on checkout click. Kept so older callers stay intent-only. */
export function trackSubscribe(
  planName?: string,
  options?: { value?: number; currency?: string }
): void {
  trackInitiateCheckout(planName, options)
}

/** Fired when Stripe checkout completes and the user lands on the purchase success page. */
export function trackPurchaseSuccess(
  planName?: string,
  options?: { value?: number; currency?: string }
): void {
  const params = pixelParams(planName, options)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", params)
    window.fbq("track", "Subscribe", params)
  }
  if (typeof window !== "undefined" && window.rkp) {
    window.rkp("event", "PURCHASE")
  }
  if (options?.value != null) {
    trackSpotifyPurchase(options.value, options.currency ?? "USD")
  }
}
