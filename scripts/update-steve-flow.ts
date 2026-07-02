/**
 * Update Steve personal agent conversation flow + global prompt.
 * Run: npx tsx scripts/update-steve-flow.ts
 * Requires RETELL_API_KEY and RETELL_STEVE_AGENT_ID in .env.
 */

import "dotenv/config"
import { updateStevePersonalAgentFlow } from "../lib/retell"

async function main() {
  await updateStevePersonalAgentFlow()
  console.log("Done. Steve personal agent flow updated.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
