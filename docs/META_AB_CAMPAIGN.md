# Meta A/B Campaign (Lean $15/day)

Source of truth: [`lib/marketing/campaigns/meta-ab-q3/`](../lib/marketing/campaigns/meta-ab-q3/)

## Export assets & playbook

```bash
npm run campaign:export-meta
# Optional: npm run campaign:export-meta -- --start=2026-07-07 --metro="Dallas-Fort Worth"
```

Outputs to `campaign-exports/meta-ab-q3/`:

| File | Purpose |
|------|---------|
| `META_ADS_PLAYBOOK.md` | Step-by-step Meta Ads Manager setup |
| `meta-ads-manager-import.csv` | Ad copy, URLs, Canva overlay fields |
| `daily-tracking.csv` | 21-day spend / signup log |
| `canva-merge.csv` | Bulk text overlays for static images |
| `creatives/*.png` | Static ad images (add Canva headlines) |
| `reels-deferred.md` | Winner-only video storyboards (Week 3+) |

## Test rounds

1. **Days 1–7:** AdSet A (Voicemail) vs AdSet D (Competition) — static only
2. **Days 8–14:** Round 1 winner vs AdSet B (Family time)
3. **Days 15–21 (optional):** Champion vs AdSet C (Bathroom humor)

Budget: **$15/day CBO**. Pause losers at **$25** spend with 0 signups.

## Meta instant form funnel

See [`META_INSTANT_FORM.md`](./META_INSTANT_FORM.md) for industry Q1 + thank-you URL → `/start` → `/funnel/[industry]`.

## Tests

```bash
npm test -- lib/marketing/campaigns/meta-ab-q3
```
