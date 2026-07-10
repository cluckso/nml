import type { Industry } from "@prisma/client"
import { getIntakeNumberForIndustry } from "@/lib/intake-routing"

type BusinessForwardingFields = {
  retellAgentId?: string | null
  retellPhoneNumber?: string | null
  industry?: Industry | null
}

/** Dedicated Retell agent + number assigned to this business. */
export function hasDedicatedCallAssistant(business: BusinessForwardingFields | null | undefined): boolean {
  return !!(business?.retellAgentId && business?.retellPhoneNumber)
}

/** Number to show for call forwarding — dedicated line first, then shared intake fallback. */
export function getBusinessForwardingNumber(
  business: BusinessForwardingFields | null | undefined
): string | null {
  if (!business) return null
  return business.retellPhoneNumber || getIntakeNumberForIndustry(business.industry) || null
}

/** User can forward calls when we have any number to display. */
export function hasForwardingNumberToShow(
  business: BusinessForwardingFields | null | undefined
): boolean {
  return getBusinessForwardingNumber(business) != null
}
