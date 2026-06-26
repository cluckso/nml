/**
 * Create Retell AI agents via API with correct {{variable}} formatting.
 * Run: npx tsx scripts/setup-retell-agents.ts
 *
 * Requires RETELL_API_KEY in env. Creates one conversation flow + agent per industry
 * using the template global prompt and flow nodes that reference {{business_name}},
 * {{tone}}, {{question_depth}}, etc. (filled per call from the inbound webhook).
 *
 * After running, add the printed env vars to .env or Vercel.
 */

import { Industry } from "@prisma/client"
import { createTemplateAgentForIndustry } from "../lib/retell"

const INDUSTRIES: Industry[] = [
  Industry.GENERIC,
  Industry.HVAC,
  Industry.PLUMBING,
  Industry.ELECTRICIAN,
  Industry.HANDYMAN,
  Industry.AUTO_REPAIR,
  Industry.CHILDCARE,
]

async function main() {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    console.error("Set RETELL_API_KEY in the environment.")
    process.exit(1)
  }

  console.log("Creating Retell agents with template flows ({{business_name}}, {{tone}}, etc.)...\n")

  const results: { industry: string; agent_id: string }[] = []

  for (const industry of INDUSTRIES) {
    try {
      const { agent_id } = await createTemplateAgentForIndustry(apiKey, industry)
      results.push({ industry, agent_id })
      console.log(`  ${industry}: ${agent_id}`)
    } catch (err) {
      console.error(`  ${industry}: failed -`, err instanceof Error ? err.message : err)
    }
  }

  console.log("\n--- Add these to your .env or Vercel ---\n")

  const generic = results.find((r) => r.industry === Industry.GENERIC)
  if (generic) {
    console.log(`RETELL_AGENT_ID=${generic.agent_id}`)
  }

  for (const { industry, agent_id } of results) {
    if (industry === Industry.GENERIC) continue
    console.log(`RETELL_AGENT_ID_${industry}=${agent_id}`)
  }

  console.log("\nDone.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
