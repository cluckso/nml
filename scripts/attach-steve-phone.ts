/** Attach or purchase a phone number for Steve personal agent. */
import "dotenv/config"

const RETELL_API_BASE = process.env.RETELL_API_BASE ?? "https://api.retellai.com"

async function main() {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_STEVE_AGENT_ID
  if (!apiKey || !agentId) throw new Error("RETELL_API_KEY and RETELL_STEVE_AGENT_ID required")

  const existing = process.env.RETELL_STEVE_PHONE
  if (existing) {
    const body = {
      inbound_agents: [{ agent_id: agentId, weight: 1 }],
      outbound_agents: [{ agent_id: agentId, weight: 1 }],
    }
    const res = await fetch(`${RETELL_API_BASE}/update-phone-number/${encodeURIComponent(existing)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(await res.text())
    console.log("Attached existing number:", existing)
    return
  }

  const body = {
    inbound_agents: [{ agent_id: agentId, weight: 1 }],
    outbound_agents: [{ agent_id: agentId, weight: 1 }],
    area_code: 608,
    country_code: "US",
  }
  const res = await fetch(`${RETELL_API_BASE}/create-phone-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(text)
  const result = JSON.parse(text) as { phone_number?: string }
  console.log("Purchased number:", result.phone_number)
  if (result.phone_number) console.log(`RETELL_STEVE_PHONE=${result.phone_number}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
