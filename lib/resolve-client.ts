import { db } from "./db"
import { normalizeE164 } from "./normalize-phone"
import { ClientStatus } from "@prisma/client"

/**
 * Resolve client (business) by the number that forwarded the call to the shared intake number.
 * Used by inbound webhook to route calls. Returns null if not found or client is paused.
 */
export async function resolveClient(forwardedFrom: string | null | undefined) {
  const normalized = normalizeE164(forwardedFrom)
  if (!normalized) return null

  const business = await db.business.findUnique({
    where: { primaryForwardingNumber: normalized, status: ClientStatus.ACTIVE },
    include: { subscription: true },
  })
  return business
}
