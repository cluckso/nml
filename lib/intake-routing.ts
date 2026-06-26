import { Industry } from "@prisma/client"
import { normalizeE164 } from "./normalize-phone"

/** Service-industry intake number (HVAC, plumbing, electrician, handyman, auto repair, generic). */
const INTAKE_NUMBER_SERVICE =
  process.env.NML_INTAKE_NUMBER_SERVICE ?? process.env.RETELL_INTAKE_SERVICE ?? null

/** Childcare intake number. */
const INTAKE_NUMBER_CHILDCARE =
  process.env.NML_INTAKE_NUMBER_CHILDCARE ?? process.env.RETELL_INTAKE_CHILDCARE ?? null

/** Fallback single intake number (legacy). */
const INTAKE_NUMBER_SHARED =
  process.env.NML_SHARED_INTAKE_NUMBER ?? process.env.RETELL_SHARED_NUMBER ?? null

/** Agent ID for service-industry calls (fallback when no industry-specific agent). */
const AGENT_ID_SERVICE = process.env.RETELL_AGENT_ID ?? null

/** Agent ID for childcare calls. */
const AGENT_ID_CHILDCARE = process.env.RETELL_AGENT_ID_CHILDCARE ?? null

/** Agent ID per industry (optional). Set RETELL_AGENT_ID_HVAC, RETELL_AGENT_ID_PLUMBING, etc. */
const AGENT_BY_INDUSTRY: Partial<Record<Industry, string | null>> = {
  HVAC: process.env.RETELL_AGENT_ID_HVAC ?? null,
  PLUMBING: process.env.RETELL_AGENT_ID_PLUMBING ?? null,
  AUTO_REPAIR: process.env.RETELL_AGENT_ID_AUTO_REPAIR ?? null,
  CHILDCARE: process.env.RETELL_AGENT_ID_CHILDCARE ?? null,
  ELECTRICIAN: process.env.RETELL_AGENT_ID_ELECTRICIAN ?? null,
  HANDYMAN: process.env.RETELL_AGENT_ID_HANDYMAN ?? null,
  GENERIC: process.env.RETELL_AGENT_ID_GENERIC ?? null,
}

/**
 * Resolve which Retell agent ID to use for an inbound call based on the business's industry.
 * Set RETELL_AGENT_ID_<INDUSTRY> (e.g. RETELL_AGENT_ID_HVAC) per industry; fallback to RETELL_AGENT_ID.
 */
export function getAgentIdForIndustry(industry: Industry | null | undefined): string | null {
  if (!industry) return AGENT_ID_SERVICE
  const id = AGENT_BY_INDUSTRY[industry]
  if (id) return id
  return AGENT_ID_SERVICE
}

/**
 * Resolve which Retell agent ID to use for an inbound call based on the number that was called (to_number).
 * Service number → service agent; childcare number → childcare agent; else fallback to RETELL_AGENT_ID.
 */
export function getAgentIdForInbound(toNumber: string | null | undefined): string | null {
  const normalized = normalizeE164(toNumber)
  if (!normalized) return AGENT_ID_SERVICE

  const childcare = normalizeE164(INTAKE_NUMBER_CHILDCARE)
  const service = normalizeE164(INTAKE_NUMBER_SERVICE)

  if (childcare && normalized === childcare && AGENT_ID_CHILDCARE) return AGENT_ID_CHILDCARE
  if (service && normalized === service && AGENT_ID_SERVICE) return AGENT_ID_SERVICE
  // Fallback: shared number or default service agent
  return AGENT_ID_SERVICE
}

/**
 * Intake number the business should forward to, based on industry.
 * Service industries (HVAC, plumbing, etc.) → service number; CHILDCARE → childcare number.
 */
export function getIntakeNumberForIndustry(industry: Industry | null | undefined): string | null {
  if (industry === "CHILDCARE" && INTAKE_NUMBER_CHILDCARE) return INTAKE_NUMBER_CHILDCARE
  if (INTAKE_NUMBER_SERVICE) return INTAKE_NUMBER_SERVICE
  return INTAKE_NUMBER_SHARED
}

/** Whether any industry-specific or shared intake number is configured (dashboard has a number to show). */
export function hasIntakeNumberConfigured(): boolean {
  return !!(INTAKE_NUMBER_SERVICE ?? INTAKE_NUMBER_CHILDCARE ?? INTAKE_NUMBER_SHARED)
}

/** All configured intake numbers (E.164). Used to reject saving an AI number as primaryForwardingNumber. */
export function getConfiguredIntakeNumbersE164(): string[] {
  const out: string[] = []
  const service = normalizeE164(INTAKE_NUMBER_SERVICE)
  const childcare = normalizeE164(INTAKE_NUMBER_CHILDCARE)
  const shared = normalizeE164(INTAKE_NUMBER_SHARED)
  if (service) out.push(service)
  if (childcare && childcare !== service) out.push(childcare)
  if (shared && !out.includes(shared)) out.push(shared)
  return out
}
