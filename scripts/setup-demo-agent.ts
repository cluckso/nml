/**
 * Create the Retell demo agent + flow and attach a phone number.
 * Run: npx tsx scripts/setup-demo-agent.ts
 *
 * Requires RETELL_API_KEY. Optionally set RETELL_DEMO_PHONE to attach an existing number.
 * Add the printed env vars to .env and Vercel.
 */

import "dotenv/config"
import { createDemoRetellAgent } from "../lib/retell"

async function main() {
  console.log("Creating demo agent + flow...\n")
  const { agent_id, phone_number } = await createDemoRetellAgent()
  console.log("Demo agent created.\n")
  console.log("--- Add these to .env and Vercel ---\n")
  console.log(`RETELL_DEMO_AGENT_ID=${agent_id}`)
  if (phone_number) {
    console.log(`NEXT_PUBLIC_DEMO_NUMBER=${phone_number}`)
  } else {
    console.log("# No phone number attached. Set RETELL_DEMO_PHONE and re-run, or buy a number in Retell.")
  }
  console.log("\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
