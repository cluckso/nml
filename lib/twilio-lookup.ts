/**
 * Twilio Lookup + Nomorobo Spam Score for blocking known spam numbers.
 * Requires: Nomorobo add-on installed in Twilio Console (Add-ons → nomorobo_spamscore).
 * Enable with FILTER_SPAM_VIA_TWILIO=true. Costs per lookup.
 */
import twilio from "twilio"

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

const ENABLED = process.env.FILTER_SPAM_VIA_TWILIO === "true"

interface NomoroboResult {
  status?: string
  result?: { score?: number }
}

/** Returns true if number is marked spam by Nomorobo. Fails open (returns false) on error. */
export async function isSpamByTwilioLookup(
  phone: string | null | undefined
): Promise<boolean> {
  if (!ENABLED || !twilioClient || !phone?.trim()) return false

  const normalized = normalizeForLookup(phone)
  if (!normalized) return false

  try {
    const result = await twilioClient.lookups.v1
      .phoneNumbers(normalized)
      .fetch({
        addOns: ["nomorobo_spamscore"],
        type: ["carrier"],
      })

    let addOns = (result as { addOns?: unknown }).addOns
    if (typeof addOns === "string") {
      try {
        addOns = JSON.parse(addOns) as Record<string, unknown>
      } catch {
        return false
      }
    }
    if (!addOns || typeof addOns !== "object") return false

    const nomorobo = (addOns as Record<string, unknown>).nomorobo_spamscore
    if (!nomorobo || typeof nomorobo !== "object") return false

    const nr = nomorobo as NomoroboResult
    if (nr.status !== "successful") return false

    const score = nr.result?.score
    return score === 1
  } catch (err) {
    console.warn("[Twilio Lookup] Spam check failed, allowing call:", err)
    return false
  }
}

function normalizeForLookup(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10 && !digits.startsWith("0")) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return null
}
