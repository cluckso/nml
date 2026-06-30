# Phone Slave Campaign — Automation Guide

Automate the 30-day "Slave to Your Phone" social campaign using campaign-as-code in the repo.

## What was built

| Piece | Location |
|-------|----------|
| Campaign copy (source of truth) | `lib/marketing/campaigns/phone-slave/posts.ts` |
| 30-day schedule | `lib/marketing/campaigns/phone-slave/schedule.ts` |
| UTM link builder | `lib/marketing/campaign-urls.ts` |
| Export script | `scripts/export-phone-slave-campaign.ts` |
| Buffer scheduler | `scripts/schedule-buffer-posts.ts` |

## Quick start (15 minutes)

### 1. Export all assets

```bash
cd nml-main
npm run campaign:export
```

Optional flags:

```bash
npm run campaign:export -- --start=2026-07-07 --tz=America/Chicago
```

This generates `campaign-exports/phone-slave/`:

| File | Use |
|------|-----|
| `canva-carousels.csv` | Canva → Bulk Create (carousel slides) |
| `canva-reels.csv` | Reel/story overlay text |
| `buffer-schedule.csv` | Review before scheduling |
| `buffer-schedule.json` | Buffer API input |
| `google-business-schedule.csv` | Manual GBP posts (no API yet) |
| `posting-calendar.ics` | Import to Google Calendar / Outlook |
| `30-day-playbook.md` | Full copy with UTM links filled in |

### 2. Canva (bulk graphics)

1. Open Canva → **Apps** → **Bulk Create**
2. Upload `canva-carousels.csv`
3. Map columns to text boxes on your carousel template
4. Repeat for `canva-reels.csv` on a Reel template
5. Download designs → attach to Buffer posts or upload when scheduling

### 3. Buffer (automated social scheduling)

Buffer handles Facebook, Instagram, LinkedIn, and X. Google Business Profile is manual (see step 4).

1. Sign up at [buffer.com](https://buffer.com) and connect your channels
2. Create a Buffer app → copy **Access Token**
3. List your profile IDs:

```bash
BUFFER_ACCESS_TOKEN=your_token npm run campaign:buffer-profiles
```

4. Add to `.env`:

```env
BUFFER_ACCESS_TOKEN=...
BUFFER_PROFILE_FACEBOOK=...
BUFFER_PROFILE_INSTAGRAM=...
BUFFER_PROFILE_LINKEDIN=...
BUFFER_PROFILE_TWITTER=...
```

5. Dry run:

```bash
npm run campaign:schedule -- --dry-run
```

6. Schedule all 30 days:

```bash
npm run campaign:schedule
```

Skip posts whose time has already passed:

```bash
npm run campaign:schedule -- --skip-past
```

### 4. Google Business Profile (manual)

Google has no simple scheduling API for most small businesses. Use `google-business-schedule.csv`:

1. Open Google Business Profile manager
2. Each row = one post on the scheduled date
3. Copy headline + body + link from the CSV
4. Set CTA to "Learn more"

**Tip:** Import `posting-calendar.ics` — GBP rows are included as calendar events on the same days.

### 5. Calendar reminders

Import `posting-calendar.ics` into Google Calendar:

- Google Calendar → Settings → Import → select the `.ics` file
- You'll get 30-minute reminders for every scheduled post including copy preview

## Tracking (UTM)

Every exported link uses:

```
utm_source=[platform]&utm_medium=social&utm_campaign=phone-slave&utm_content=day[N]-[post-id]
```

Funnel leads already capture UTM fields in `FunnelLead` — trial signups from this campaign will show up with `utm_campaign=phone-slave`.

## Paid boost schedule

Posts marked `boost: yes` in the campaign data:

| Week | Post | Suggested budget |
|------|------|------------------|
| 1 | `master-carousel` (Day 1) | $15/day × 5 days |
| 2 | `plumbing-carousel` (Day 8) | $15/day × 5 days |
| 3 | `electrical-carousel` (Day 15) | $15/day × 5 days |
| 4 | `master-carousel` + `roi-calculator` | $20/day × 7 days |

Boost in Meta Ads Manager using the same creative + UTM links from the export.

## Editing the campaign

1. Edit copy in `lib/marketing/campaigns/phone-slave/posts.ts`
2. Edit timing in `lib/marketing/campaigns/phone-slave/schedule.ts`
3. Re-run `npm run campaign:export`
4. Re-run `npm run campaign:schedule` (Buffer will create new queued posts — delete old queue in Buffer UI if re-running)

## Zapier option (no code)

If you prefer zero scripting for social:

1. Keep using the export for Canva + GBP
2. Use Buffer's native UI to import CSV manually
3. For lead alerts when UTM traffic converts: set `FUNNEL_LEAD_WEBHOOK_URL` to a Zapier catch hook → Slack notification

## What's not automated yet

| Channel | Why | Workaround |
|---------|-----|------------|
| Google Business | No simple API for posts | CSV + calendar reminders |
| Canva image generation | Needs your brand templates | Bulk Create CSV |
| Meta paid ads | Requires Ads Manager | Manual boost with exported copy |
| Email drip | Not wired to this campaign | Use Resend + future cron (see below) |

### Future: email nurture (optional)

The repo already uses Resend for transactional email. A follow-up cron could send the 3-touch email sequence from the campaign doc to `FunnelLead` rows where `utm_campaign=phone-slave`. Not implemented yet — say the word if you want that next.

## npm scripts reference

```bash
npm run campaign:export              # Generate all export files
npm run campaign:buffer-profiles     # List Buffer profile IDs
npm run campaign:schedule -- --dry-run
npm run campaign:schedule
```

## Environment variables

| Variable | Required for | Description |
|----------|--------------|-------------|
| `CAMPAIGN_START_DATE` | Export | ISO date, e.g. `2026-07-07` |
| `CAMPAIGN_TZ` | Export | IANA timezone, default `America/New_York` |
| `BUFFER_ACCESS_TOKEN` | Schedule | Buffer API token |
| `BUFFER_PROFILE_*` | Schedule | Per-channel profile IDs |
| `NEXT_PUBLIC_APP_URL` | Export links | Default `https://www.callgrabbr.com` |
