# SEO tracking and monitoring (KAN-13)

## Live properties

| System | Value |
|--------|--------|
| Canonical site | `https://www.callgrabbr.com` |
| Google Search Console | www property (HTML tag verification) |
| Sitemap | https://www.callgrabbr.com/sitemap.xml |
| Robots | https://www.callgrabbr.com/robots.txt |
| GA4 | `G-F7EPPRSNR1` (see `lib/seo-monitoring.ts`) |
| Vercel Analytics | `@vercel/analytics` on the root layout |
| GTM | optional `NEXT_PUBLIC_GTM_ID` |

Verification token: `GOOGLE_SITE_VERIFICATION` env, with fallback in `lib/seo-monitoring.ts` / root layout.

## One-time Search Console setup

1. Confirm the **www** property is verified (meta tag already ships on every page).
2. Add the **non-www** property only as a redirect alias if Google still lists it — prefer www as primary.
3. **Sitemaps → Add** `https://www.callgrabbr.com/sitemap.xml` and confirm “Success”.
4. Use **URL Inspection** on `/`, `/pricing`, `/for/hvac`, and one `/guides/*` URL after each major content deploy.
5. Optional: Bing Webmaster Tools → import from Google Search Console.

## Weekly check (15 minutes)

1. Search Console → **Coverage / Pages**: new “Not indexed” reasons on money pages?
2. **Performance**: impressions for “missed call” / trade + “answering” queries — note wins/losses.
3. **Sitemaps**: last read time fresh; no error.
4. Spot-check live `robots.txt` still points at the www sitemap and disallows `/dashboard/`, `/sign-in`, `/subscribe/`.
5. GA4 → Realtime or Landing page report after a deploy (confirm tag fires).

## After content or pricing changes

1. Bump `lastmod` sources in `lib/public-sitemap.ts` / `lib/guides/authorship.ts`.
2. Deploy, then Request indexing on changed URLs in Search Console.
3. Confirm `/llms.txt` still lists current pricing.

## Automated guards

- `lib/__tests__/seo-audit-lengths.test.ts` — title/description length floors
- `lib/__tests__/seo-crawl-config.test.ts` — robots disallow + sitemap must-include / blocklist
- `lib/__tests__/seo-keywords.test.ts` — intent map coverage
