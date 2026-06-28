/**
 * Funnel-specific analytics — Meta Pixel (fbq) + GTM dataLayer hooks.
 * GTM: push events to window.dataLayer when a GTM container is configured.
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
    dataLayer?: Record<string, unknown>[]
  }
}

function pushDataLayer(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  // GTM: window.dataLayer.push({ event: 'funnel_step_complete', ... })
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...params })
}

export function trackFunnelView(industry: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "FunnelView", { industry })
  }
  pushDataLayer("funnel_view", { funnel_industry: industry })
}

export function trackFunnelStepComplete(
  industry: string,
  stepId: string,
  stepIndex: number
): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "FunnelStepComplete", {
      industry,
      step_id: stepId,
      step_index: stepIndex,
    })
  }
  pushDataLayer("funnel_step_complete", {
    funnel_industry: industry,
    funnel_step_id: stepId,
    funnel_step_index: stepIndex,
  })
}

export function trackFunnelLeadSubmit(industry: string, score: number): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", { content_name: industry, value: score })
  }
  pushDataLayer("funnel_lead_submit", {
    funnel_industry: industry,
    funnel_lead_score: score,
  })
}

export function trackFunnelConversion(industry: string, ctaType: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "FunnelConversion", { industry, cta_type: ctaType })
  }
  pushDataLayer("funnel_conversion", {
    funnel_industry: industry,
    funnel_cta_type: ctaType,
  })
}
