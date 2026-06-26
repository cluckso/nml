import { db } from "./db"
import { normalizeE164 } from "./normalize-phone"
import { ClientStatus } from "@prisma/client"

/**
 * Resolve client (business) by the number that forwards the call to the shared intake number.
 * Used by inbound webhook to route calls. Returns null if not found or client is paused.
 */
export async function resolveClient(forwardedFrom: string | null | undefined) {
  const normalized = normalizeE164(forwardedFrom)
  if (!normalized) return null

  const business = await db.business.findFirst({
    where: {
      primaryForwardingNumber: normalized,
      status: ClientStatus.ACTIVE,
    },
  })
  return business
}

/**
 * Resolve client (business) by their dedicated Retell phone number (the AI number they own).
 * This is the preferred method: each business has their own Retell number, so we look up by to_number.
 * Returns null if not found or client is paused.
 */
export async function resolveClientByRetellNumber(toNumber: string | null | undefined) {
  const normalized = normalizeE164(toNumber)
  if (!normalized) return null

  const business = await db.business.findFirst({
    where: {
      retellPhoneNumber: normalized,
      status: ClientStatus.ACTIVE,
    },
  })
  return business
}
