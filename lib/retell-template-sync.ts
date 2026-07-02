import "server-only"
import { readFile } from "fs/promises"
import { join } from "path"
import type { Industry } from "@prisma/client"
import { updateTemplateAgentForIndustry } from "./retell"

type TemplateAgentEntry = {
  agent_id: string
  conversation_flow_id: string
  version?: number
}

/**
 * Sync all industry template agents from retell-agents-by-industry.json.
 * Run: npx tsx scripts/sync-retell-agents.ts
 */
export async function updateAllTemplateAgents(): Promise<void> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY required")

  const configPath = join(process.cwd(), "retell-agents-by-industry.json")
  const raw = await readFile(configPath, "utf-8")
  const config = JSON.parse(raw) as Record<string, TemplateAgentEntry>

  for (const [industryKey, entry] of Object.entries(config)) {
    const industry = industryKey as Industry
    const { version } = await updateTemplateAgentForIndustry(apiKey, industry, entry)
    console.info(`Updated ${industry} template agent to flow version`, version)
  }
}
