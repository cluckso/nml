export const SITE_ORIGIN = 'https://www.callgrabbr.com'
export const TRIAL_START_URL = `${SITE_ORIGIN}/trial/start`
export const SIGN_UP_URL = `${SITE_ORIGIN}/sign-up`
export const PRICING_WEB_URL = `${SITE_ORIGIN}/pricing`

/** Open a page in the system browser (legal, trial, billing fallback). */
export function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
