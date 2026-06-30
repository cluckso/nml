/**
 * Schedule Phone Slave campaign posts to Buffer from exported JSON.
 *
 * Setup:
 *   1. Create a Buffer account and connect Facebook, Instagram, LinkedIn, X.
 *   2. Get access token: https://buffer.com/developers/apps
 *   3. List profile IDs: npm run campaign:buffer-profiles
 *   4. Add to .env:
 *        BUFFER_ACCESS_TOKEN=...
 *        BUFFER_PROFILE_FACEBOOK=...
 *        BUFFER_PROFILE_INSTAGRAM=...
 *        BUFFER_PROFILE_LINKEDIN=...
 *        BUFFER_PROFILE_TWITTER=...
 *
 * Usage:
 *   npm run campaign:schedule -- --dry-run
 *   npm run campaign:schedule
 *   npm run campaign:schedule -- --skip-past
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const JSON_PATH = path.join(__dirname, "../campaign-exports/phone-slave/buffer-schedule.json")

type ScheduleRow = {
  scheduled_at_utc: string
  platform: string
  post_id: string
  title: string
  text: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes("--dry-run"),
    skipPast: args.includes("--skip-past"),
    jsonPath: args.find((a) => a.startsWith("--json="))?.slice("--json=".length) ?? JSON_PATH,
  }
}

function getProfileId(platform: string): string | undefined {
  const map: Record<string, string | undefined> = {
    facebook: process.env.BUFFER_PROFILE_FACEBOOK,
    instagram: process.env.BUFFER_PROFILE_INSTAGRAM,
    linkedin: process.env.BUFFER_PROFILE_LINKEDIN,
    twitter: process.env.BUFFER_PROFILE_TWITTER,
  }
  return map[platform]
}

function loadSchedule(jsonPath: string): ScheduleRow[] {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing ${jsonPath}. Run: npm run campaign:export`)
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as ScheduleRow[]
}

async function scheduleToBuffer(
  profileId: string,
  text: string,
  scheduledAt: number,
  dryRun: boolean
): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (dryRun) {
    return { ok: true, id: "dry-run" }
  }

  const body = new URLSearchParams({
    access_token: process.env.BUFFER_ACCESS_TOKEN!,
    profile_ids: profileId,
    text,
    scheduled_at: String(scheduledAt),
    shorten: "true",
  })

  const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const data = (await res.json()) as {
    success?: boolean
    message?: string
    updates?: Array<{ id: string }>
  }

  if (!res.ok || !data.success) {
    return { ok: false, error: data.message ?? `HTTP ${res.status}` }
  }

  return { ok: true, id: data.updates?.[0]?.id }
}

async function listProfiles(): Promise<void> {
  const token = process.env.BUFFER_ACCESS_TOKEN
  if (!token) {
    console.error("Set BUFFER_ACCESS_TOKEN in .env")
    process.exit(1)
  }

  const res = await fetch(
    `https://api.bufferapp.com/1/profiles.json?access_token=${token}`
  )
  const data = (await res.json()) as {
    profiles?: Array<{ id: string; service: string; formatted_username: string }>
  }

  if (!data.profiles?.length) {
    console.log("No profiles found. Connect channels in Buffer first.")
    return
  }

  console.log("Buffer profiles — add these to .env:\n")
  for (const p of data.profiles) {
    const envKey = `BUFFER_PROFILE_${p.service.toUpperCase()}`
    console.log(`${envKey}=${p.id}  # ${p.formatted_username}`)
  }
}

async function main() {
  if (process.argv.includes("--profiles")) {
    await listProfiles()
    return
  }

  const { dryRun, skipPast, jsonPath } = parseArgs()
  const token = process.env.BUFFER_ACCESS_TOKEN

  if (!dryRun && !token) {
    console.error("Set BUFFER_ACCESS_TOKEN in .env (or use --dry-run)")
    process.exit(1)
  }

  const rows = loadSchedule(jsonPath)
  const now = Date.now()
  let scheduled = 0
  let skipped = 0
  let failed = 0

  console.log(dryRun ? "DRY RUN — no posts will be sent to Buffer\n" : "Scheduling to Buffer...\n")

  for (const row of rows) {
    const profileId = getProfileId(row.platform)
    if (!profileId && !dryRun) {
      console.warn(`SKIP ${row.post_id} (${row.platform}): no BUFFER_PROFILE_* env var`)
      skipped++
      continue
    }

    const scheduledAt = Math.floor(new Date(row.scheduled_at_utc).getTime() / 1000)
    if (skipPast && scheduledAt * 1000 < now) {
      console.log(`SKIP past: ${row.title} (${row.platform})`)
      skipped++
      continue
    }

    const result = await scheduleToBuffer(profileId ?? "dry-run", row.text, scheduledAt, dryRun)

    if (result.ok) {
      console.log(
        `OK ${dryRun ? "[dry-run] " : ""}${row.platform} · ${row.title} · ${row.scheduled_at_utc}`
      )
      scheduled++
    } else {
      console.error(`FAIL ${row.platform} · ${row.title}: ${result.error}`)
      failed++
    }

    if (!dryRun) await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`\nDone: ${scheduled} scheduled, ${skipped} skipped, ${failed} failed`)
  if (dryRun) {
    console.log("\nRemove --dry-run to publish to Buffer.")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
