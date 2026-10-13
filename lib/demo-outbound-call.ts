import { getDemoNumberTel } from "@/lib/demo-line"
import { normalizeE164 } from "@/lib/normalize-phone"
import { siteUrl } from "@/lib/site-url"
import { trialHeadlineLabel } from "@/lib/trial-marketing"

const RETELL_CREATE_CALL_URL = "https://api.retellai.com/v2/create-phone-call"
const SMS_MAX_CHARS = 1500

export class DemoOutboundConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DemoOutboundConfigError"
  }
}

export class DemoOutboundProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DemoOutboundProviderError"
  }
}

export type DemoCallMetadata = {
  demo_phone?: string
  source?: string
  demo_call?: boolean | string
  client_id?: string
  forwarded_from_number?: string
}

/** Number Retell dials from. Falls back to the public demo line. */
export function getDemoOutboundFromNumber(): string {
  const fromEnv = process.env.RETELL_FROM_NUMBER?.trim()
  return (fromEnv && normalizeE164(fromEnv)) || getDemoNumberTel()
}

/**
 * Who should receive the one demo-result SMS.
 * Outbound calls put the visitor on to_number (and metadata.demo_phone).
 * Inbound calls put the visitor on from_number.
 */
export function resolveDemoResultSmsPhone(input: {
  fromNumber?: string | null
  toNumber?: string | null
  metadata?: DemoCallMetadata | null
  demoNumber?: string | null
}): string | null {
  const tagged = input.metadata?.demo_phone
    ? normalizeE164(input.metadata.demo_phone)
    : null
  if (tagged) return tagged

  const from = input.fromNumber ? normalizeE164(input.fromNumber) : null
  const to = input.toNumber ? normalizeE164(input.toNumber) : null
  const demo = input.demoNumber ? normalizeE164(input.demoNumber) : null

  if (from && demo && from === demo && to && to !== demo) return to
  return from
}

export function isOutboundDemoCall(metadata?: DemoCallMetadata | null): boolean {
  if (!metadata) return false
  return metadata.source === "demo-landing" || typeof metadata.demo_phone === "string"
}

export function buildOutboundDemoSummarySms(summary: string): string {
  const body = summary.trim() || "Thanks for trying the CallGrabbr demo!"
  const text =
    `CallGrabbr demo summary:\n${body}\n\n` +
    `This is what your shop would get on every missed call. ` +
    `Start ${trialHeadlineLabel()}: ${siteUrl("/")}`
  return text.slice(0, SMS_MAX_CHARS)
}

export async function createDemoOutboundCall(toNumber: string): Promise<{ callId: string }> {
  const apiKey = process.env.RETELL_API_KEY?.trim()
  const agentId = process.env.RETELL_DEMO_AGENT_ID?.trim()
  const fromNumber = getDemoOutboundFromNumber()

  if (!apiKey || !agentId) {
    throw new DemoOutboundConfigError("Demo calling is not configured.")
  }

  const res = await fetch(RETELL_CREATE_CALL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId,
      metadata: {
        demo_phone: toNumber,
        source: "demo-landing",
        demo_call: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Retell create-call failed", res.status, err)
    throw new DemoOutboundProviderError("Could not start demo call.")
  }

  const data = (await res.json()) as { call_id?: string }
  if (!data.call_id) {
    console.error("Retell create-call response missing call_id")
    throw new DemoOutboundProviderError("Could not start demo call.")
  }

  return { callId: data.call_id }
}
