/**
 * Update the existing demo agent's flow and voice settings.
 * Run: npx tsx scripts/update-demo-flow.ts
 * Requires RETELL_API_KEY and RETELL_DEMO_AGENT_ID in .env.
 */

import "dotenv/config"
import { updateDemoAgentFlow } from "../lib/retell"

async function main() {
  await updateDemoAgentFlow()
  console.log("Done. Demo agent flow updated (natural name usage, single confirmation, polite end).")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
