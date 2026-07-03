# Owner Tips Campaign — Daily educational posts

**Goal:** Build trust with local service business owners by posting **one helpful tip per day** — topics adjacent to phones, leads, intake, reviews, and operations (natural path to CallGrabbr without hard-selling every post).

**Tone:** Educational first. Soft CTA on most days; trial CTA on days 21, 28, and 30. Follow `docs/BRAND_VOICE.md` and `public/brand_ref.png` for visuals.

**Campaign ID (UTM):** `owner-tips`

---

## What was built

| Piece | Location |
|-------|----------|
| 30 tip posts | `lib/marketing/campaigns/owner-tips/posts.ts` |
| 30-day schedule | `lib/marketing/campaigns/owner-tips/schedule.ts` |
| Export script | `scripts/export-owner-tips-campaign.ts` |
| Brand tokens | `lib/brand.ts` |
| Cursor rule | `.cursor/rules/callgrabbr-brand.mdc` |

---

## Quick start

### 1. Export assets

```bash
cd nml-main
npm run campaign:export-tips
```

Optional:

```bash
npm run campaign:export-tips -- --start=2026-07-07 --tz=America/Chicago
```

Outputs `campaign-exports/owner-tips/`:

| File | Use |
|------|-----|
| `canva-carousels.csv` | Canva Bulk Create — one slide per tip (headline + body) |
| `buffer-schedule.csv` / `.json` | Buffer scheduling |
| `google-business-schedule.csv` | Manual GBP posts (days 4, 10, 18, 25, 30) |
| `posting-calendar.ics` | Calendar reminders |
| `30-day-playbook.md` | Full copy reference |

### 2. Canva template

1. Open **`public/brand_ref.png`** for colors and logo placement.
2. Dark navy background `#050B18`, primary accent `#3B8FF6`, text `#F1F5F9`.
3. Use `public/logo_HD.png` on end cards or footer — do not recolor.
4. Bulk Create from `canva-carousels.csv` — map `slide1_headline` and `slide1_body` to text boxes.
5. Optional footer: `CallGrabbr` + `callgrabbr.com`.

### 3. Schedule (default cadence)

- **Daily 7:00 AM ET** — Facebook + Instagram (primary tip)
- **LinkedIn** — days 1, 5, 10, 15, 22, 29 at 10:00 AM
- **X/Twitter** — days 2, 7, 13, 20, 27 at noon
- **Google Business** — days 4, 10, 18, 25, 30 at 9:00 AM
- **Day 30** — marked `boost: true` for optional paid reach

Use the same Buffer env vars as the Phone Slave campaign (`docs/PHONE_SLAVE_CAMPAIGN_AUTOMATION.md`). Point `campaign:schedule` at `owner-tips/buffer-schedule.json` or schedule manually from CSV.

---

## Tip topics (30 days)

| Day | Topic |
|-----|--------|
| 1 | Speed to lead (5-minute callback) |
| 2 | Voicemail myth |
| 3 | After-hours call value |
| 4 | Intake basics (name, phone, problem, address) |
| 5 | Google review replies |
| 6 | HVAC peak season phone plan |
| 7 | Ring-first vs answer-all forwarding |
| 8 | Text-back habit |
| 9 | Don't quote blind on the phone |
| 10 | Who answers on the crew |
| 11 | Emergency keywords |
| 12 | Weekend coverage without burnout |
| 13 | Weekly missed-call audit |
| 14 | Callback discipline |
| 15 | Service area clarity |
| 16 | Plumbing 2 AM mindset |
| 17 | Electrical safety intake |
| 18 | Auto YMM + symptom |
| 19 | Review ask timing |
| 20 | GBP hours accuracy |
| 21 | Competitor speed (+ trial CTA) |
| 22 | Hold music hurts |
| 23 | Batch callbacks between jobs |
| 24 | What intake shouldn't promise |
| 25 | Seasonal phone prep |
| 26 | Voicemail greeting hygiene |
| 27 | Define a real lead |
| 28 | Auto-ack text (+ trial CTA) |
| 29 | Hire reception vs forward |
| 30 | Systems beat heroics (+ trial CTA) |

---

## Extending the campaign

Add posts to `OWNER_TIPS_POSTS` in `posts.ts`, schedule entries in `schedule.ts`, then re-run `npm run campaign:export-tips`.

Keep tips **actionable in under 60 seconds of reading**. Avoid promising CallGrabbr features we don't ship. Use `lib/trial-marketing.ts` for trial wording.

---

## Related

- Conversion campaign: `lib/marketing/campaigns/phone-slave/`
- Brand voice: `docs/BRAND_VOICE.md`
- Ad copy: `docs/AD_COPY_AND_IMAGE_PROMPT.md`
