export const SITE_ORIGIN = 'https://www.callgrabbr.com'
export const PRICING_WEB_URL = `${SITE_ORIGIN}/pricing`

/** Open a page in the system browser (legal, Stripe Connect, billing fallback). */
export function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
