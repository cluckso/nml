import { normalizeE164 } from "@/lib/normalize-phone"
import { formatPhoneForDisplay } from "@/lib/utils"

const FALLBACK_DEMO_E164 = "+12029526890"

/** Public demo line (Retell). Env may be E.164 or formatted. */
export function getDemoNumberRaw(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DEMO_NUMBER?.trim()
  return fromEnv || FALLBACK_DEMO_E164
}

export function getDemoNumberTel(): string {
  return normalizeE164(getDemoNumberRaw()) ?? FALLBACK_DEMO_E164
}

export function getDemoNumberDisplay(): string {
  return formatPhoneForDisplay(getDemoNumberTel()) || getDemoNumberRaw()
}
