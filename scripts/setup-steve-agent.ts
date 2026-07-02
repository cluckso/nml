/**
 * Create Steve Steinhoff personal missed-call agent + flow.
 * Run: npx tsx scripts/setup-steve-agent.ts
 *
 * Requires RETELL_API_KEY. Optionally set RETELL_STEVE_PHONE to attach an existing number.
 * Edit config/steve-personal-agent.ts before running.
 */

import "dotenv/config"
import { createStevePersonalRetellAgent } from "../lib/retell"

async function main() {
  console.log("Creating Steve personal agent + flow...\n")
  const { agent_id, phone_number } = await createStevePersonalRetellAgent()
  console.log("Steve personal agent created.\n")
  console.log("--- Add these to .env ---\n")
  console.log(`RETELL_STEVE_AGENT_ID=${agent_id}`)
  if (phone_number) {
    console.log(`RETELL_STEVE_PHONE=${phone_number}`)
  } else {
    console.log("# No phone attached. Set RETELL_STEVE_PHONE to an existing Retell number and re-run, or buy in Retell.")
  }
  console.log("\n--- Retell Dashboard (manual) ---")
  console.log("1. Enable post-call email to your address (see summaryEmail in config/steve-personal-agent.ts)")
  console.log("2. Match post-call analysis fields: name, phone, caller_type, reason, company_name, priority_flag")
  console.log("3. Forward your cell/work line to the Retell number above")
  console.log("\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
