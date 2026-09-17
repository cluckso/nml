/** Canonical public legal URLs (must match production website). */
export const PRIVACY_POLICY_URL = 'https://www.callgrabbr.com/privacy'
export const TERMS_OF_SERVICE_URL = 'https://www.callgrabbr.com/terms'
export const SMS_TERMS_URL = 'https://www.callgrabbr.com/sms-terms'

/** Open a legal page in the system browser / external WebView. */
export function openLegalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
