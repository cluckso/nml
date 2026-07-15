import { normalizeE164 } from "./normalize-phone"

export type DemoInboundConfig = {
  demoNumberRaw?: string | null
  demoAgentId?: string | null
}

export type DemoInboundResponse = {
  call_inbound: {
    override_agent_id: string
    metadata: { demo_call: true }
  }
}

/** True when metadata marks this as a public demo call. */
export function metadataDemoFlag(
  metadata: Record<string, unknown> | null | undefined
): boolean {
  if (!metadata || typeof metadata !== "object") return false
  return metadata.demo_call === true || metadata.demo_call === "true"
}

/** True when the dialed number matches the configured public demo line. */
export function isDemoInboundCall(
  toNumber: string | null | undefined,
  demoNumberRaw: string | null | undefined
): boolean {
  const toNumberNorm = toNumber ? normalizeE164(toNumber) ?? undefined : undefined
  const demoNumberNorm = demoNumberRaw ? normalizeE164(demoNumberRaw) : null
  return !!(toNumberNorm && demoNumberNorm && toNumberNorm === demoNumberNorm)
}

/** Demo calls always route to the dedicated demo agent when env is configured. */
export function resolveDemoInboundResponse(
  config: DemoInboundConfig
): DemoInboundResponse | null {
  const { demoNumberRaw, demoAgentId } = config
  if (!demoAgentId?.trim()) return null
  if (!demoNumberRaw?.trim()) return null
  return {
    call_inbound: {
      override_agent_id: demoAgentId.trim(),
      metadata: { demo_call: true },
    },
  }
}

export type SignupInboundClient = {
  id: string
  retellAgentId?: string | null
  status?: string
}

/**
 * Signup/trial businesses are answered when ACTIVE and have a dedicated agent id
 * (provisioned at onboarding) or a legacy industry/env fallback agent id.
 */
export function canAnswerSignupInbound(
  client: SignupInboundClient | null | undefined,
  agentId: string | null | undefined
): client is SignupInboundClient {
  return !!(client && agentId)
}
