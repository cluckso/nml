/**
 * Attach a phone number to the existing demo agent.
 * Run: npx tsx scripts/attach-demo-phone.ts
 *
 * Requires RETELL_API_KEY and RETELL_DEMO_AGENT_ID.
 * Set RETELL_DEMO_PHONE to attach an existing number, or leave unset to try purchasing (various area codes).
 */

import "dotenv/config"
import { attachPhoneToDemoAgent } from "../lib/retell"

async function main() {
  const agentId = process.env.RETELL_DEMO_AGENT_ID
  if (!agentId) {
    console.error("Set RETELL_DEMO_AGENT_ID in .env (from setup-demo-agent.ts output)")
    process.exit(1)
  }
  console.log("Attaching phone to demo agent", agentId, "...\n")
  const phone = await attachPhoneToDemoAgent(agentId)
  if (phone) {
    console.log("Done. Add to .env:\n")
    console.log(`NEXT_PUBLIC_DEMO_NUMBER=${phone}`)
  } else {
    console.log("No number attached. Set RETELL_DEMO_PHONE to an existing Retell number and re-run.")
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
