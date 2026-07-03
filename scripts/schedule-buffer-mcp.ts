/**
 * Schedule campaign posts via Buffer MCP (Publish API).
 *
 * Uses BUFFER_ACCESS_TOKEN from .env (from https://publish.buffer.com/settings/api).
 * Legacy REST tokens are not supported — use this script or Cursor Buffer MCP.
 *
 * Usage:
 *   npm run campaign:schedule-mcp -- --dry-run
 *   npm run campaign:schedule-mcp
 *   npm run campaign:schedule-mcp -- --json=campaign-exports/owner-tips/buffer-schedule.json --max=10
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_JSON = path.join(__dirname, "../campaign-exports/phone-slave/buffer-schedule.json")
const MCP_URL = "https://mcp.buffer.com/mcp"
const DEFAULT_INSTAGRAM_IMAGE =
  process.env.CAMPAIGN_INSTAGRAM_IMAGE_URL ?? "https://www.callgrabbr.com/opengraph-image"

type ScheduleRow = {
  scheduled_at_utc: string
  platform: string
  post_id: string
  title: string
  text: string
}

type Channel = { id: string; service: string; displayName: string }

type Account = {
  timezone: string
  organizations: Array<{
    id: string
    name: string
    limits?: { scheduledPosts?: number }
  }>
  currentTime: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  const maxArg = args.find((a) => a.startsWith("--max="))?.slice("--max=".length)
  return {
    dryRun: args.includes("--dry-run"),
    skipPast: args.includes("--skip-past"),
    jsonPath: args.find((a) => a.startsWith("--json="))?.slice("--json=".length) ?? DEFAULT_JSON,
    max: maxArg ? Number(maxArg) : undefined,
  }
}

function parseSseJson(text: string) {
  const line = text.split("\n").find((l) => l.startsWith("data:")) ?? text
  return JSON.parse(line.replace(/^data:\s*/, "")) as {
    result?: { content?: Array<{ text?: string }>; isError?: boolean }
    error?: { message?: string }
  }
}

class BufferMcpClient {
  private sessionId = crypto.randomUUID()
  private id = 0

  constructor(private token: string) {}

  private headers() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${this.token}`,
      "Mcp-Session-Id": this.sessionId,
    }
  }

  private async rpc(method: string, params: Record<string, unknown>) {
    const res = await fetch(MCP_URL, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: ++this.id }),
    })
    return parseSseJson(await res.text())
  }

  async init() {
    await this.rpc("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "callgrabbr-scheduler", version: "1.0.0" },
    })
    await fetch(MCP_URL, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
    })
  }

  private async callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const res = await this.rpc("tools/call", { name, arguments: args })
    if (res.error) throw new Error(res.error.message ?? `MCP error calling ${name}`)
    const text = res.result?.content?.[0]?.text
    if (!text) throw new Error(`Empty response from ${name}`)
    const parsed = JSON.parse(text) as T & { error?: string }
    if (parsed.error) throw new Error(parsed.error)
    if (res.result?.isError) throw new Error(parsed.error ?? `Tool ${name} failed`)
    return parsed
  }

  async getAccount(): Promise<Account> {
    return this.callTool<Account>("get_account", {})
  }

  async listChannels(organizationId: string): Promise<Channel[]> {
    return this.callTool<Channel[]>("list_channels", { organizationId })
  }

  async countScheduled(organizationId: string): Promise<number> {
    const data = await this.callTool<{ edges: unknown[] }>("list_posts", {
      organizationId,
      status: ["scheduled"],
    })
    return data.edges?.length ?? 0
  }

  async createPost(args: Record<string, unknown>) {
    return this.callTool<{ id: string; status: string; dueAt?: string }>("create_post", args)
  }
}

function loadSchedule(jsonPath: string): ScheduleRow[] {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing ${jsonPath}. Run: npm run campaign:export-tips`)
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as ScheduleRow[]
}

function utcToChicagoIso(utc: string): string {
  const d = new Date(utc)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d)
  const p = Object.fromEntries(parts.filter((x) => x.type !== "literal").map((x) => [x.type, x.value]))
  const utcAsLocal = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }))
  const chiAsLocal = new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" }))
  const offsetMs = chiAsLocal.getTime() - utcAsLocal.getTime()
  const sign = offsetMs >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMs)
  const oh = String(Math.floor(abs / 3_600_000)).padStart(2, "0")
  const om = String(Math.floor((abs % 3_600_000) / 60_000)).padStart(2, "0")
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${sign}${oh}:${om}`
}

function channelMetadata(service: string): Record<string, unknown> | undefined {
  if (service === "facebook") return { facebook: { type: "post" } }
  if (service === "instagram") return { instagram: { type: "post", shouldShareToFeed: true } }
  if (service === "googlebusiness") return { googlebusiness: { type: "post" } }
  return undefined
}

function mapPlatform(platform: string): string {
  if (platform === "google-business" || platform === "google_business") return "googlebusiness"
  return platform
}

async function main() {
  const { dryRun, skipPast, jsonPath, max } = parseArgs()
  const token = process.env.BUFFER_ACCESS_TOKEN
  if (!token) {
    console.error("Set BUFFER_ACCESS_TOKEN in .env (https://publish.buffer.com/settings/api)")
    process.exit(1)
  }

  const rows = loadSchedule(jsonPath)
  const client = new BufferMcpClient(token)
  await client.init()

  const account = await client.getAccount()
  const org = account.organizations[0]
  if (!org) throw new Error("No Buffer organization on account")

  const channels = await client.listChannels(org.id)
  const channelByService = new Map(channels.map((c) => [c.service, c]))
  const scheduledCount = dryRun ? 0 : await client.countScheduled(org.id)
  const planLimit = org.limits?.scheduledPosts ?? 10
  const remainingSlots = Math.max(0, planLimit - scheduledCount)
  const cap = max ?? remainingSlots

  console.log(`Organization: ${org.name} (${org.id})`)
  console.log(`Channels: ${channels.map((c) => `${c.service}=${c.displayName}`).join(", ")}`)
  console.log(`Scheduled slots: ${scheduledCount}/${planLimit} used, scheduling up to ${cap} posts`)
  if (dryRun) console.log("DRY RUN — no posts will be created\n")
  else console.log()

  const now = new Date(account.currentTime).getTime()
  let created = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    if (created >= cap) break

    const service = mapPlatform(row.platform)
    const channel = channelByService.get(service)
    if (!channel) {
      skipped++
      continue
    }

    const dueMs = new Date(row.scheduled_at_utc).getTime()
    if (skipPast && dueMs < now) {
      console.log(`SKIP past: ${row.title} (${service})`)
      skipped++
      continue
    }

    const dueAt = utcToChicagoIso(row.scheduled_at_utc)
    const metadata = channelMetadata(service)
    const payload: Record<string, unknown> = {
      channelId: channel.id,
      text: row.text,
      mode: "customScheduled",
      dueAt,
      schedulingType: "automatic",
    }
    if (metadata) payload.metadata = metadata
    if (service === "instagram") {
      payload.assets = [
        {
          image: {
            url: DEFAULT_INSTAGRAM_IMAGE,
            metadata: { altText: "CallGrabbr — AI phone receptionist for trade businesses" },
          },
        },
      ]
    }

    if (dryRun) {
      console.log(`OK [dry-run] ${service} · ${row.title} · ${dueAt}`)
      created++
      continue
    }

    try {
      const post = await client.createPost(payload)
      console.log(`OK ${service} · ${row.title} · ${post.dueAt ?? dueAt} · id=${post.id}`)
      created++
      await new Promise((r) => setTimeout(r, 400))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`FAIL ${service} · ${row.title}: ${msg}`)
      failed++
      if (msg.toLowerCase().includes("scheduled") && msg.toLowerCase().includes("limit")) break
    }
  }

  const unmatched = rows.filter((r) => !channelByService.has(mapPlatform(r.platform))).length
  console.log(`\nDone: ${created} scheduled, ${skipped} skipped (${unmatched} rows need channels not connected), ${failed} failed`)
  if (created < rows.filter((r) => channelByService.has(mapPlatform(r.platform))).length) {
    console.log(`\nBuffer plan allows ${planLimit} scheduled posts. Upgrade or publish queued posts, then re-run to schedule more.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
