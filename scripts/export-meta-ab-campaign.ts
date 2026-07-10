/**
 * Export Meta A/B lean campaign ($15/day) — playbook, Ads Manager checklist,
 * tracking CSV, Canva merge sheet, and image prompts.
 *
 * Usage:
 *   npx tsx scripts/export-meta-ab-campaign.ts
 *   npx tsx scripts/export-meta-ab-campaign.ts --start=2026-07-07
 *   npx tsx scripts/export-meta-ab-campaign.ts --metro="Dallas-Fort Worth"
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  META_AB_CONFIG,
  META_AB_ROUNDS,
  META_AB_CAMPAIGN_ID,
  listMetaAbVariants,
  buildMetaAbLandingUrl,
  getMetaAbVariant,
} from "../lib/marketing/campaigns/meta-ab-q3"
import type { MetaAbAdVariant, MetaAbRound } from "../lib/marketing/campaigns/meta-ab-q3"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, "../campaign-exports/meta-ab-q3")

function parseArgs() {
  const args = process.argv.slice(2)
  let start = new Date().toISOString().slice(0, 10)
  let metro = META_AB_CONFIG.geo.metro

  for (const arg of args) {
    if (arg.startsWith("--start=")) start = arg.slice("--start=".length)
    if (arg.startsWith("--metro=")) metro = arg.slice("--metro=".length)
  }

  return { start, metro }
}

function csvEscape(value: string | undefined): string {
  const v = value ?? ""
  if (v.includes('"') || v.includes(",") || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n")
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00")
  d.setDate(d.getDate() + days - 1)
  return d.toISOString().slice(0, 10)
}

function exportAdsManagerSheet(variants: MetaAbAdVariant[]): void {
  const rows: string[][] = [
    [
      "ad_set_name",
      "variant_id",
      "round",
      "active_days",
      "headline",
      "description",
      "primary_text",
      "cta",
      "landing_url",
      "creative_file",
      "canva_headline",
      "canva_sub",
      "canva_badge",
      "placement",
      "daily_budget_note",
    ],
  ]

  for (const round of META_AB_ROUNDS) {
    for (const variantId of round.variantIds) {
      const v = getMetaAbVariant(variantId)
      const overlay = v.creative.canvaOverlay
      rows.push([
        v.adSetName,
        v.id,
        round.id,
        `Day ${round.dayStart}–${round.dayEnd}`,
        v.headline,
        v.description,
        v.primaryText,
        v.cta === "SIGN_UP" ? "Sign Up" : "Learn More",
        buildMetaAbLandingUrl(v),
        v.creative.assetFile ?? "",
        overlay.headline,
        overlay.sub ?? "",
        overlay.badge ?? "",
        META_AB_CONFIG.placements.join("; "),
        `$${META_AB_CONFIG.dailyBudgetUsd}/day CBO — max 2 ad sets active`,
      ])
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "meta-ads-manager-import.csv"), toCsv(rows))
}

function exportTrackingSheet(start: string): void {
  const rows: string[][] = [
    [
      "date",
      "day",
      "round",
      "active_variants",
      "spend_usd",
      "impressions",
      "clicks",
      "ctr_pct",
      "signups",
      "cpa_usd",
      "action",
      "notes",
    ],
  ]

  for (let day = 1; day <= META_AB_CONFIG.totalDays; day++) {
    const round = META_AB_ROUNDS.find((r) => day >= r.dayStart && day <= r.dayEnd)
    const date = addDays(start, day)
    const active =
      day <= 7
        ? "a-voicemail vs d-competition"
        : day <= 14
          ? "round1_winner vs b-family"
          : "champion vs c-bathroom (optional)"
    rows.push([date, String(day), round?.id ?? "", active, "", "", "", "", "", "", "", ""])
  }

  fs.writeFileSync(path.join(OUT_DIR, "daily-tracking.csv"), toCsv(rows))
}

function exportCanvaMerge(variants: MetaAbAdVariant[]): void {
  const rows: string[][] = [
    ["variant_id", "image_file", "headline", "subline", "badge", "cta_button"],
  ]
  for (const v of variants) {
    const o = v.creative.canvaOverlay
    rows.push([
      v.id,
      v.creative.assetFile ?? "",
      o.headline,
      o.sub ?? "",
      o.badge ?? "",
      "Start Free Trial",
    ])
  }
  fs.writeFileSync(path.join(OUT_DIR, "canva-merge.csv"), toCsv(rows))
}

function exportImagePrompts(variants: MetaAbAdVariant[]): void {
  const lines = variants.map(
    (v) => `## ${v.id} (${v.creative.format})

**Canva overlay:** ${v.creative.canvaOverlay.headline}${v.creative.canvaOverlay.sub ? ` · ${v.creative.canvaOverlay.sub}` : ""}${v.creative.canvaOverlay.badge ? ` · ${v.creative.canvaOverlay.badge}` : ""}

**Prompt:**
${v.creative.imagePrompt}

**Negative:**
${v.creative.negativePrompt}
`
  )
  fs.writeFileSync(path.join(OUT_DIR, "image-prompts.md"), `# Meta A/B Image Prompts\n\n${lines.join("\n---\n\n")}`)
}

function exportReelsDeferred(variants: MetaAbAdVariant[]): void {
  const lines = [
    "# Meta A/B Reels — Deferred Until Winner",
    "",
    "Produce **one** 15s Reels for the winning headline after Round 1–2.",
    "Do not upload Reels until static CPA/CTR winner is declared.",
    "",
  ]

  for (const v of variants) {
    if (!v.reels) continue
    lines.push(`## ${v.id}: ${v.reels.scriptName}`)
    lines.push("")
    lines.push(`**Video prompt:** ${v.reels.videoPrompt}`)
    lines.push("")
    lines.push("| Time | Visual | Caption |")
    lines.push("|------|--------|---------|")
    for (const row of v.reels.storyboard) {
      lines.push(`| ${row.time} | ${row.visual} | ${row.caption} |`)
    }
    lines.push("")
  }

  fs.writeFileSync(path.join(OUT_DIR, "reels-deferred.md"), lines.join("\n"))
}

function exportPlaybook(start: string, metro: string): void {
  const cfg = META_AB_CONFIG
  const roundBlocks = META_AB_ROUNDS.map(
    (r: MetaAbRound) => `### ${r.label} (Days ${r.dayStart}–${r.dayEnd})
- **Active ad sets:** ${r.variantIds.map((id) => getMetaAbVariant(id).adSetName).join(" vs ")}
- **Goal:** ${r.learnGoal}
`
  ).join("\n")

  const variantBlocks = listMetaAbVariants()
    .map((v) => {
      return `#### ${v.adSetName}
- **Headline:** ${v.headline}
- **URL:** ${buildMetaAbLandingUrl(v)}
- **Creative:** \`${v.creative.assetFile}\`
- **Canva:** ${v.creative.canvaOverlay.headline}`
    })
    .join("\n\n")

  const md = `# CallGrabbr Meta A/B Campaign — Ads Manager Playbook

Campaign ID: \`${META_AB_CAMPAIGN_ID}\`  
Generated: ${new Date().toISOString()}  
Test start: **${start}**  
Budget: **$${cfg.dailyBudgetUsd}/day** CBO (~$${cfg.dailyBudgetUsd * 14} over 14 core days)

---

## 1. Campaign setup (Meta Ads Manager)

1. **Create campaign**
   - Name: \`${cfg.campaignName}\`
   - Objective: ${cfg.objective}
   - Campaign budget: **$${cfg.dailyBudgetUsd}/day** (CBO enabled)
   - No cost cap

2. **Ad account pixel**
   - Verify Meta Pixel / Conversions API fires **CompleteRegistration** on \`${cfg.landingPath}\`
   - Test event in Events Manager before spending

3. **Placements (manual)**
   - Include: ${cfg.placements.map((p) => `**${p}**`).join(", ")}
   - Exclude: ${cfg.excludedPlacements.join(", ")}

4. **Audience (both ad sets — keep identical across rounds)**
   - Location: **${metro}** + ${cfg.geo.radiusMiles} mile radius
   - Age: ${cfg.ageMin}–${cfg.ageMax}
   - Interests: ${cfg.targetingInterests.join(", ")}
   - Exclude: Website visitors last 14 days

---

## 2. Sequential rounds

${roundBlocks}

**Round 1 launch:** Enable only **AdSet_A_LossVoicemail** and **AdSet_D_Competition**. Pause B and C.

**Round 2 (Day 8):** Pause Round 1 loser. Add **AdSet_B_FamilyTime**. Keep winner running.

**Round 3 (Day 15, optional):** Only if any signups or CPA < $40. Test **AdSet_C_BathroomHumor** vs champion.

---

## 3. Kill / win rules

| Rule | Threshold |
|------|-----------|
| Pause ad | **$${cfg.killRules.maxSpendNoConversionUsd}** spend, 0 signups |
| Pause ad | CTR < **${cfg.killRules.minCtrPercent}%** after 1,000 impressions |
| Declare winner | Lowest CPA after 7 days; tie → higher CTR |

**Expectations at $${cfg.dailyBudgetUsd}/day:** 0–3 signups in 14 days is normal. Goal = headline learning.

---

## 4. Ad copy & assets

${variantBlocks}

---

## 5. Week 3+ optimization (only if CPA acceptable)

- Add **one** Reels creative to winning ad set (see \`reels-deferred.md\`)
- **OR** raise budget to $25–30/day on single winning ad set
- Do **not** add retargeting or lookalikes until **$30+/day** budget

---

## 6. Files in this export

| File | Purpose |
|------|---------|
| \`meta-ads-manager-import.csv\` | Copy/paste reference for ad creation |
| \`daily-tracking.csv\` | Daily spend, CTR, signups log |
| \`canva-merge.csv\` | Bulk Canva text overlay |
| \`image-prompts.md\` | Regenerate / iterate creatives |
| \`reels-deferred.md\` | Winner-only video storyboards |
| \`creatives/*.png\` | Static images (add Canva overlays) |

---

## 7. Compliance

- Use "when callers share their details" for lead capture claims
- Avoid guaranteed revenue — "one captured job can pay for months"
- Brand spelling: **CallGrabbr**
`

  fs.writeFileSync(path.join(OUT_DIR, "META_ADS_PLAYBOOK.md"), md)
}

function main() {
  const { start, metro } = parseArgs()
  fs.mkdirSync(path.join(OUT_DIR, "creatives"), { recursive: true })

  const variants = listMetaAbVariants()

  exportPlaybook(start, metro)
  exportAdsManagerSheet(variants)
  exportTrackingSheet(start)
  exportCanvaMerge(variants)
  exportImagePrompts(variants)
  exportReelsDeferred(variants)

  console.log(`\nMeta A/B campaign exported to:\n  ${OUT_DIR}\n`)
  console.log("Files:")
  for (const f of fs.readdirSync(OUT_DIR, { recursive: true })) {
    console.log(`  - ${f}`)
  }
  console.log(`\nRound 1 launch: enable AdSet_A + AdSet_D only ($${META_AB_CONFIG.dailyBudgetUsd}/day CBO)`)
}

main()
