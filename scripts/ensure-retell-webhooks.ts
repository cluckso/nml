/**
 * Ensure every business with a Retell number has the inbound webhook URL configured.
 * Usage: npx tsx scripts/ensure-retell-webhooks.ts
 */
import { db } from "../lib/db"
import { ensureRetellInboundWebhookForBusiness } from "../lib/retell"

async function main() {
  const businesses = await db.business.findMany({
    where: {
      retellPhoneNumber: { not: null },
      retellAgentId: { not: null },
    },
    select: { id: true, name: true, retellPhoneNumber: true },
  })

  console.info(`Ensuring inbound webhook for ${businesses.length} business(es)...`)
  for (const business of businesses) {
    try {
      await ensureRetellInboundWebhookForBusiness(business.id)
      console.info("OK", business.name, business.retellPhoneNumber)
    } catch (err) {
      console.error("FAIL", business.name, business.retellPhoneNumber, err)
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
