/**
 * Create one Retell agent + conversation flow per business type (industry).
 * Run from project root: npm run create-retell-agents
 * Requires: RETELL_API_KEY in env or in .env / .env.local
 *
 * Output: prints agent_id and flow_id per industry, and writes retell-agents-by-industry.json
 */

import { readFileSync, existsSync, writeFileSync } from "fs"
import { resolve } from "path"
import { Industry } from "@prisma/client"
import { createAgentAndFlowForIndustry } from "../lib/retell"

function loadEnv() {
  const roots = [resolve(process.cwd(), ".env.local"), resolve(process.cwd(), ".env")]
  for (const p of roots) {
    if (!existsSync(p)) continue
    const content = readFileSync(p, "utf8")
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (m) {
        const key = m[1]
        let val = m[2].replace(/^["']|["']$/g, "").trim()
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}

loadEnv()

const RETELL_API_KEY = process.env.RETELL_API_KEY
if (!RETELL_API_KEY) {
  console.error("Missing RETELL_API_KEY. Set it in .env, .env.local, or the environment.")
  process.exit(1)
}

const INDUSTRIES = Object.values(Industry) as Industry[]

async function main() {
  const results: Record<string, { agent_id: string; conversation_flow_id: string; version: number }> = {}

  for (const industry of INDUSTRIES) {
    try {
      const out = await createAgentAndFlowForIndustry(RETELL_API_KEY, industry)
      results[industry] = out
      console.log(`${industry}: agent_id=${out.agent_id} flow_id=${out.conversation_flow_id} version=${out.version}`)
    } catch (err) {
      console.error(`${industry}: failed`, err instanceof Error ? err.message : err)
    }
  }

  const outPath = resolve(process.cwd(), "retell-agents-by-industry.json")
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8")
  console.log("\nWrote", outPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
