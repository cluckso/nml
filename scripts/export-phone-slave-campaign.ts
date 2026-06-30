/**
 * Export Phone Slave campaign to Buffer CSV, Canva CSV, ICS calendar, and playbook markdown.
 *
 * Usage:
 *   npx tsx scripts/export-phone-slave-campaign.ts
 *   npx tsx scripts/export-phone-slave-campaign.ts --start=2026-07-07
 *   npx tsx scripts/export-phone-slave-campaign.ts --tz=America/Chicago
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  appendCampaignLink,
  buildCampaignUrl,
  type CampaignPlatform,
} from "../lib/marketing/campaign-urls"
import {
  getPhoneSlavePost,
  PHONE_SLAVE_POSTS,
  PHONE_SLAVE_SCHEDULE,
} from "../lib/marketing/campaigns/phone-slave"
import type { CampaignPost } from "../lib/marketing/campaigns/types"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, "../campaign-exports/phone-slave")

const CAMPAIGN_ID = "phone-slave"
const DEFAULT_TZ = "America/New_York"

function parseArgs() {
  const args = process.argv.slice(2)
  let start = process.env.CAMPAIGN_START_DATE
  let tz = process.env.CAMPAIGN_TZ ?? DEFAULT_TZ

  for (const arg of args) {
    if (arg.startsWith("--start=")) start = arg.slice("--start=".length)
    if (arg.startsWith("--tz=")) tz = arg.slice("--tz=".length)
  }

  if (!start) {
    const d = new Date()
    const day = d.getDay()
    const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day
    d.setDate(d.getDate() + daysUntilMonday)
    start = d.toISOString().slice(0, 10)
  }

  return { start, tz }
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

function normalizePlatforms(
  platform: CampaignPlatform | CampaignPlatform[]
): CampaignPlatform[] {
  return Array.isArray(platform) ? platform : [platform]
}

function mapPlatformToBuffer(platform: CampaignPlatform): string {
  const map: Record<CampaignPlatform, string> = {
    facebook: "facebook",
    instagram: "instagram",
    linkedin: "linkedin",
    twitter: "twitter",
    google_business: "google_business",
    reels: "facebook",
  }
  return map[platform]
}

function platformSupportsBuffer(platform: CampaignPlatform): boolean {
  return platform !== "google_business"
}

function formatHashtags(post: CampaignPost): string {
  if (!post.hashtags?.length) return ""
  return post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")
}

function buildPostText(
  post: CampaignPost,
  platform: CampaignPlatform,
  contentKey: string
): string {
  if (post.format === "thread" && post.thread?.length) {
    return post.thread
      .map((t, i) => `${i + 1}/${post.thread!.length} ${t}`)
      .join("\n\n")
  }

  if (post.format === "google_business" && post.googleBusiness) {
    const link = buildCampaignUrl({
      platform,
      campaign: CAMPAIGN_ID,
      content: contentKey,
    })
    return `${post.googleBusiness.headline}\n\n${post.googleBusiness.body}\n\n${link}`
  }

  const link = buildCampaignUrl({
    platform,
    campaign: CAMPAIGN_ID,
    content: contentKey,
    useSignUp: platform === "facebook" || platform === "instagram",
  })

  let text = appendCampaignLink(post.caption, {
    platform,
    campaign: CAMPAIGN_ID,
    content: contentKey,
    useSignUp: platform === "facebook" || platform === "instagram",
  })

  if (!text.includes(link)) {
    text = `${text}\n\n👉 ${link}`
  }

  const tags = formatHashtags(post)
  if (tags && platform !== "linkedin" && platform !== "twitter") {
    text = `${text}\n\n${tags}`
  }

  return text
}

/** Convert local date/time in a timezone to a UTC Date. */
function zonedTimeToUtc(
  dateStr: string,
  dayOffset: number,
  time: string,
  timeZone: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const localDay = day + dayOffset - 1

  let utcMs = Date.UTC(year, month - 1, localDay, hour, minute, 0)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(utcMs)).map((p) => [p.type, p.value])
    )
    const shownHour = parseInt(parts.hour === "24" ? "0" : parts.hour, 10)
    const shownMinute = parseInt(parts.minute, 10)
    const shownDay = parseInt(parts.day, 10)
    const targetDay = localDay
    const dayDiff = targetDay - shownDay
    const diffMinutes = dayDiff * 24 * 60 + (hour - shownHour) * 60 + (minute - shownMinute)
    if (diffMinutes === 0) break
    utcMs += diffMinutes * 60 * 1000
  }

  return new Date(utcMs)
}

function formatIsoLocal(d: Date, tz: string): string {
  return d.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function exportBufferCsv(start: string, tz: string): void {
  const rows: string[][] = [
    [
      "scheduled_at_utc",
      "scheduled_at_local",
      "platform",
      "post_id",
      "format",
      "industry",
      "title",
      "text",
      "link",
      "boost",
      "notes",
    ],
  ]

  for (const entry of PHONE_SLAVE_SCHEDULE) {
    const post = getPhoneSlavePost(entry.postId)
    const when = zonedTimeToUtc(start, entry.day, entry.time, tz)

    for (const platform of normalizePlatforms(entry.platform)) {
      if (!platformSupportsBuffer(platform)) continue

      const contentKey = `day${entry.day}-${entry.postId}-${platform}`
      rows.push([
        when.toISOString(),
        formatIsoLocal(when, tz),
        mapPlatformToBuffer(platform),
        entry.postId,
        entry.format,
        entry.industry,
        post.title,
        buildPostText(post, platform, contentKey),
        buildCampaignUrl({
          platform,
          campaign: CAMPAIGN_ID,
          content: contentKey,
          useSignUp: platform === "facebook" || platform === "instagram",
        }),
        post.boost ? "yes" : "no",
        entry.notes ?? "",
      ])
    }
  }

  const dataRows = rows.slice(1).map((row) => ({
    scheduled_at_utc: row[0],
    scheduled_at_local: row[1],
    platform: row[2],
    post_id: row[3],
    format: row[4],
    industry: row[5],
    title: row[6],
    text: row[7],
    link: row[8],
    boost: row[9],
    notes: row[10],
  }))

  fs.writeFileSync(path.join(OUT_DIR, "buffer-schedule.csv"), toCsv(rows), "utf8")
  fs.writeFileSync(
    path.join(OUT_DIR, "buffer-schedule.json"),
    JSON.stringify(dataRows, null, 2),
    "utf8"
  )
}

function exportGoogleBusinessCsv(start: string, tz: string): void {
  const rows: string[][] = [
    [
      "scheduled_at_local",
      "post_id",
      "industry",
      "headline",
      "body",
      "cta",
      "link",
      "notes",
    ],
  ]

  for (const entry of PHONE_SLAVE_SCHEDULE) {
    const platforms = normalizePlatforms(entry.platform)
    if (!platforms.includes("google_business")) continue

    const post = getPhoneSlavePost(entry.postId)
    if (!post.googleBusiness) continue

    const when = zonedTimeToUtc(start, entry.day, entry.time, tz)
    const contentKey = `day${entry.day}-${entry.postId}-gbp`

    rows.push([
      formatIsoLocal(when, tz),
      entry.postId,
      entry.industry,
      post.googleBusiness.headline,
      post.googleBusiness.body,
      post.googleBusiness.cta ?? "Learn more",
      buildCampaignUrl({
        platform: "google_business",
        campaign: CAMPAIGN_ID,
        content: contentKey,
      }),
      entry.notes ?? "",
    ])
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "google-business-schedule.csv"),
    toCsv(rows),
    "utf8"
  )
}

function exportCanvaCarouselCsv(): void {
  const rows: string[][] = [
    [
      "post_id",
      "industry",
      "title",
      "slide1_headline",
      "slide1_body",
      "slide1_sub",
      "slide2_headline",
      "slide2_body",
      "slide2_sub",
      "slide3_headline",
      "slide3_body",
      "slide3_sub",
      "slide4_headline",
      "slide4_body",
      "slide4_sub",
      "slide5_headline",
      "slide5_body",
      "slide5_sub",
      "caption",
    ],
  ]

  for (const post of Object.values(PHONE_SLAVE_POSTS)) {
    if (!post.slides?.length) continue

    const slideCols: string[] = []
    for (let i = 0; i < 5; i++) {
      const s = post.slides[i]
      slideCols.push(s?.headline ?? "", s?.body ?? "", s?.sub ?? "")
    }

    rows.push([
      post.id,
      post.industry,
      post.title,
      ...slideCols,
      post.caption.replace(/\n/g, " "),
    ])
  }

  fs.writeFileSync(path.join(OUT_DIR, "canva-carousels.csv"), toCsv(rows), "utf8")
}

function exportCanvaReelsCsv(): void {
  const rows: string[][] = [
    [
      "post_id",
      "industry",
      "title",
      "overlay1",
      "overlay2",
      "overlay3",
      "overlay4",
      "overlay5",
      "overlay6",
      "overlay7",
      "caption",
    ],
  ]

  for (const post of Object.values(PHONE_SLAVE_POSTS)) {
    if (!post.overlays?.length) continue
    const cols = Array.from({ length: 7 }, (_, i) => post.overlays![i] ?? "")
    rows.push([
      post.id,
      post.industry,
      post.title,
      ...cols,
      post.caption.replace(/\n/g, " "),
    ])
  }

  fs.writeFileSync(path.join(OUT_DIR, "canva-reels.csv"), toCsv(rows), "utf8")
}

function exportIcs(start: string, tz: string): void {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CallGrabbr//Phone Slave Campaign//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:CallGrabbr Phone Slave Campaign",
    `X-WR-TIMEZONE:${tz}`,
  ]

  for (const entry of PHONE_SLAVE_SCHEDULE) {
    const post = getPhoneSlavePost(entry.postId)
    const when = zonedTimeToUtc(start, entry.day, entry.time, tz)
    const end = new Date(when.getTime() + 30 * 60 * 1000)
    const platforms = normalizePlatforms(entry.platform).join(", ")

    const formatUtc = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")

    const uid = `phone-slave-day${entry.day}-${entry.postId}@callgrabbr.com`
    const summary = `Post: ${post.title} (${platforms})`
    const description = [
      `Day ${entry.day}`,
      `Platforms: ${platforms}`,
      `Format: ${entry.format}`,
      `Industry: ${entry.industry}`,
      entry.notes ? `Notes: ${entry.notes}` : "",
      "",
      "Copy preview:",
      buildPostText(
        post,
        normalizePlatforms(entry.platform)[0],
        `day${entry.day}-${entry.postId}`
      ).slice(0, 500),
    ]
      .filter(Boolean)
      .join("\\n")

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatUtc(new Date())}`,
      `DTSTART:${formatUtc(when)}`,
      `DTEND:${formatUtc(end)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT"
    )
  }

  lines.push("END:VCALENDAR")
  fs.writeFileSync(path.join(OUT_DIR, "posting-calendar.ics"), lines.join("\r\n"), "utf8")
}

function exportPlaybook(start: string, tz: string): void {
  const sections: string[] = [
    "# Phone Slave Campaign — 30-Day Playbook",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Campaign start:** ${start} (${tz})`,
    `**Campaign ID:** \`${CAMPAIGN_ID}\``,
    "",
    "## Quick start",
    "",
    "1. Import `canva-carousels.csv` into Canva Bulk Create.",
    "2. Run `npm run campaign:schedule -- --dry-run` then `npm run campaign:schedule` to push to Buffer.",
    "3. Use `google-business-schedule.csv` for manual GBP posts.",
    "4. Import `posting-calendar.ics` into Google Calendar.",
    "",
    "---",
    "",
  ]

  let currentDay = 0
  for (const entry of PHONE_SLAVE_SCHEDULE) {
    if (entry.day !== currentDay) {
      currentDay = entry.day
      const date = zonedTimeToUtc(start, entry.day, entry.time, tz)
      sections.push(
        `## Day ${entry.day} — ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: tz })}`
      )
      sections.push("")
    }

    const post = getPhoneSlavePost(entry.postId)
    const platforms = normalizePlatforms(entry.platform).join(", ")
    const when = zonedTimeToUtc(start, entry.day, entry.time, tz)

    sections.push(`### ${formatIsoLocal(when, tz)} · ${platforms}`)
    sections.push("")
    sections.push(
      `**${post.title}** · \`${entry.postId}\` · ${entry.format}${entry.notes ? ` · ${entry.notes}` : ""}`
    )
    sections.push("")

    if (post.slides?.length) {
      sections.push("**Slides / on-image text:**")
      for (const [i, slide] of post.slides.entries()) {
        sections.push(
          `${i + 1}. **${slide.headline}**${slide.body ? ` — ${slide.body}` : ""}${slide.sub ? ` _(${slide.sub})_` : ""}`
        )
      }
      sections.push("")
    }

    if (post.overlays?.length) {
      sections.push("**Reel/Story overlays:** " + post.overlays.join(" → "))
      sections.push("")
    }

    const primaryPlatform = normalizePlatforms(entry.platform)[0]
    const text = buildPostText(post, primaryPlatform, `day${entry.day}-${entry.postId}`)
    sections.push("**Copy:**")
    sections.push("```")
    sections.push(text)
    sections.push("```")
    sections.push("")
    sections.push("---")
    sections.push("")
  }

  fs.writeFileSync(path.join(OUT_DIR, "30-day-playbook.md"), sections.join("\n"), "utf8")
}

function main() {
  const { start, tz } = parseArgs()
  fs.mkdirSync(OUT_DIR, { recursive: true })

  exportBufferCsv(start, tz)
  exportGoogleBusinessCsv(start, tz)
  exportCanvaCarouselCsv()
  exportCanvaReelsCsv()
  exportIcs(start, tz)
  exportPlaybook(start, tz)

  console.log(`Phone Slave campaign exported to ${OUT_DIR}`)
  console.log(`  Start date: ${start}`)
  console.log(`  Timezone:   ${tz}`)
  console.log("")
  console.log("Files:")
  console.log("  buffer-schedule.csv          → Buffer scheduling")
  console.log("  google-business-schedule.csv → Manual GBP posts")
  console.log("  canva-carousels.csv          → Canva Bulk Create")
  console.log("  canva-reels.csv              → Reel overlay text")
  console.log("  posting-calendar.ics         → Calendar reminders")
  console.log("  30-day-playbook.md           → Full copy reference")
  console.log("")
  console.log("Next: npm run campaign:schedule -- --dry-run")
}

main()
