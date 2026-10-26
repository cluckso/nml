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

1. Search Console → **Indexing → Pages**: investigate new exclusion/error reasons on `/`, `/pricing`, `/for/*`, and `/guides/*`; confirm a sample URL with URL Inspection when status changes.
2. **Performance → Search results**: use Web search, 28 days vs previous 28 days. Review clicks, impressions, CTR, and average position by page and query. Track missed-call, after-hours, and trade + answering terms separately; record changes rather than treating position alone as a success metric.
3. **Sitemaps**: confirm the sitemap was read recently, has no errors, and its discovered URL count is in line with the public routes.
4. Fetch the deployed `/robots.txt` and `/sitemap.xml` after SEO or routing changes. Check robots allows `/`, points to the www sitemap, and disallows private app routes. Check the sitemap is HTTP 200 XML, uses www canonical URLs, includes core marketing pages, and excludes private routes.
5. GA4 → **Reports → Realtime** after a deploy to verify page views arrive. In **Reports → Acquisition → Traffic acquisition**, compare Organic Search sessions over 28 days vs the previous 28 days. In **Engagement → Landing page**, review organic landing pages and their engagement.
6. Review sign-up/trial outcomes from Organic Search separately from page views. The app sends `funnel_lead_submit` and `funnel_conversion` to the data layer for GTM; these only appear in GA4 if the configured GTM container forwards them as GA4 events. Do not report them as GA4 conversions until that wiring is verified.

Escalate a sustained drop in organic clicks or sessions, a new indexing issue on a priority landing page, or sitemap/robots fetch errors. Annotate the date and affected routes so changes can be compared with deploys and content edits.

## Crawl verification after deploys

Run from a terminal or use Search Console URL Inspection on the deployed site:

```sh
curl -fsS https://www.callgrabbr.com/robots.txt
curl -fsS -D - https://www.callgrabbr.com/sitemap.xml -o /tmp/callgrabbr-sitemap.xml
```

Confirm the robots response points at `https://www.callgrabbr.com/sitemap.xml`. The sitemap response should be `200` with an XML content type and a `<urlset>` containing the canonical public URLs. Check the response in a browser or URL Inspection if a URL is blocked, redirected away from www, or missing from the sitemap. Automated contract checks run with `npm test -- lib/__tests__/seo-crawl-config.test.ts`.

## After content or pricing changes

1. Bump `lastmod` sources in `lib/public-sitemap.ts` / `lib/guides/authorship.ts`.
2. Deploy, then Request indexing on changed URLs in Search Console.
3. Confirm `/llms.txt` still lists current pricing.
4. Compare Search Console clicks/impressions and GA4 Organic Search landing-page sessions against the previous 28-day period in the next weekly review.

## Automated guards

- `lib/__tests__/seo-audit-lengths.test.ts` — title/description length floors
- `lib/__tests__/seo-crawl-config.test.ts` — robots disallow + sitemap must-include / blocklist
- `lib/__tests__/seo-keywords.test.ts` — intent map coverage
