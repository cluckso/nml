/**
 * Sync all industry template agents from retell-agents-by-industry.json.
 * Run: npx tsx scripts/sync-retell-agents.ts
 * Requires RETELL_API_KEY in .env.
 */

import "dotenv/config"
import { updateAllTemplateAgents } from "../lib/retell"

async function main() {
  await updateAllTemplateAgents()
  console.log("Done. All template agents updated with natural CS voice and flows.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
