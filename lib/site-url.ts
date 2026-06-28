/** Canonical public site URL (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com").replace(
  /\/$/,
  ""
)

export function siteUrl(path = ""): string {
  if (!path) return SITE_URL
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
