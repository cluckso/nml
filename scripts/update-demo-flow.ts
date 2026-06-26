/**
 * Update the existing demo agent's flow (e.g. with extract_dynamic_variable for parsed lead fields).
 * Run: npx tsx scripts/update-demo-flow.ts
 * Requires RETELL_API_KEY and RETELL_DEMO_AGENT_ID in .env.
 */

import "dotenv/config"
import { updateDemoAgentFlow } from "../lib/retell"

async function main() {
  await updateDemoAgentFlow()
  console.log("Done. Demo agent now uses the updated flow with structured extraction (name, phone, address, reason, vehicle, appointment).")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
