import { db } from "./db"
import { normalizeE164 } from "./normalize-phone"

/**
 * Resolve client (business) by the number that forwards the call to the shared intake number.
 * Used by inbound webhook to route calls. Returns null if not found or client is inactive.
 */
export async function resolveClient(forwardedFrom: string | null | undefined) {
  const normalized = normalizeE164(forwardedFrom)
  if (!normalized) return null

  const business = await db.business.findFirst({
    where: {
      businessLinePhone: normalized,
      isActive: true,
    },
    include: { subscription: true },
  })
  return business
}
