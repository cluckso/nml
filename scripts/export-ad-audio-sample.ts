/**
 * Export a Retell call recording from the demo agent for marketing / ad clips.
 *
 * Usage:
 *   npx tsx scripts/export-ad-audio-sample.ts
 *   npx tsx scripts/export-ad-audio-sample.ts --call-id call_abc123
 *   npx tsx scripts/export-ad-audio-sample.ts --list
 *
 * Requires RETELL_API_KEY. Uses RETELL_DEMO_AGENT_ID when set; otherwise picks latest "CallGrabbr Demo" call.
 *
 * Output: public/audio/<slug>.wav and prints suggested trim timestamps from transcript.
 */

import "dotenv/config"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

const RETELL_API_BASE = process.env.RETELL_API_BASE ?? "https://api.retellai.com"

type Utterance = { role?: string; content?: string; words?: { word: string; start: number; end: number }[] }
type CallRow = {
  call_id: string
  agent_id?: string
  agent_name?: string
  recording_url?: string
  duration_ms?: number
  transcript?: string
  transcript_object?: Utterance[]
}

async function retellPost<T>(path: string, body: unknown): Promise<T> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is required")
  const res = await fetch(`${RETELL_API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Retell ${path} failed (${res.status}): ${await res.text()}`)
  return res.json() as Promise<T>
}

async function retellGet<T>(path: string): Promise<T> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is required")
  const res = await fetch(`${RETELL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`Retell GET ${path} failed (${res.status}): ${await res.text()}`)
  return res.json() as Promise<T>
}

async function listDemoCalls(limit = 10): Promise<CallRow[]> {
  const demoAgentId = process.env.RETELL_DEMO_AGENT_ID
  const filter = demoAgentId
    ? { filter_criteria: { agent: [{ agent_id: demoAgentId }] } }
    : {}
  const result = await retellPost<{ calls?: CallRow[] }>("/v2/list-calls", { ...filter, limit })
  const calls = result.calls ?? []
  if (demoAgentId) return calls
  return calls.filter((c) => c.agent_name === "CallGrabbr Demo")
}

function slugify(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 48) || "sample"
}

function suggestClips(call: CallRow): { label: string; startSec: number; endSec: number; text: string }[] {
  const clips: { label: string; startSec: number; endSec: number; text: string }[] = []
  const utterances = call.transcript_object ?? []
  for (const u of utterances) {
    if (u.role !== "agent" || !u.words?.length || !u.content?.trim()) continue
    const start = u.words[0].start
    const end = u.words[u.words.length - 1].end
    const text = u.content.trim()
    if (end - start < 1.5) continue
    if (/demo line|who am i speaking|thanks for calling/i.test(text)) {
      clips.push({ label: "Opening greeting", startSec: start, endSec: end, text })
    }
    if (/stressful|urgent|got it|okay|what do you need|best number/i.test(text)) {
      clips.push({ label: "Empathy / intake", startSec: start, endSec: end, text })
    }
  }
  return clips.slice(0, 6)
}

async function downloadRecording(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
}

async function main() {
  const args = process.argv.slice(2)
  const listOnly = args.includes("--list")
  const callIdArg = args.find((a) => a.startsWith("--call-id="))?.split("=")[1]
    ?? (args.includes("--call-id") ? args[args.indexOf("--call-id") + 1] : undefined)

  if (listOnly) {
    const calls = await listDemoCalls(15)
    if (!calls.length) {
      console.log("No demo calls found. Call the demo line or use Retell web call playground first.")
      return
    }
    for (const c of calls) {
      console.log(
        `${c.call_id}  ${Math.round((c.duration_ms ?? 0) / 1000)}s  ${c.recording_url ? "has recording" : "no recording"}`
      )
      if (c.transcript) console.log(`  ${c.transcript.replace(/\n/g, " ").slice(0, 120)}...`)
    }
    return
  }

  let call: CallRow
  if (callIdArg) {
    call = await retellGet<CallRow>(`/v2/get-call/${callIdArg}`)
  } else {
    const calls = await listDemoCalls(20)
    call = calls.find((c) => c.recording_url && (c.duration_ms ?? 0) > 15000) ?? calls.find((c) => c.recording_url) ?? calls[0]
    if (!call) throw new Error("No demo calls with recordings. Make a test call first.")
  }

  if (!call.recording_url) {
    throw new Error(`Call ${call.call_id} has no recording_url yet. Wait for call_ended or enable recording on the agent.`)
  }

  const outDir = join(process.cwd(), "public", "audio")
  await mkdir(outDir, { recursive: true })
  const filename = `${slugify(call.call_id)}.wav`
  const dest = join(outDir, filename)
  await downloadRecording(call.recording_url, dest)

  console.log("\nExported demo agent audio")
  console.log(`  Call ID:     ${call.call_id}`)
  console.log(`  Agent:       ${call.agent_name ?? call.agent_id}`)
  console.log(`  Duration:    ${Math.round((call.duration_ms ?? 0) / 1000)}s`)
  console.log(`  Saved:       public/audio/${filename}`)
  console.log(`  Recording:   ${call.recording_url}`)

  const clips = suggestClips(call)
  if (clips.length) {
    console.log("\nSuggested ad trim points (use CapCut, Audacity, or ffmpeg):")
    for (const clip of clips) {
      console.log(`  [${clip.startSec.toFixed(1)}s – ${clip.endSec.toFixed(1)}s] ${clip.label}`)
      console.log(`    "${clip.text.slice(0, 100)}${clip.text.length > 100 ? "…" : ""}"`)
    }
  }

  console.log("\nHomepage: add to config/audio-examples.ts:")
  console.log(`  { src: "/audio/${filename}", title: "Demo — HVAC intake (full call)" },`)
  console.log("\nFor a 15s Meta ad, trim ~6–8s of agent-only audio (empathy + one question) over B-roll.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
