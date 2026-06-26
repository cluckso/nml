import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a US/E.164 phone number for display, e.g. +1 (608) 641-9145. */
export function formatPhoneForDisplay(raw: string | null | undefined): string {
  if (raw == null || raw === "") return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}

/** Normalize US phone to E.164 (+1XXXXXXXXXX). Returns null if invalid. */
export function normalizePhoneToE164(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return null
}

// --- Auth validation (sign-up / sign-in) ---

const EMAIL_MAX_LENGTH = 255
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
/** Simple email format: local@domain with at least one dot in domain. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): { ok: true; email: string } | { ok: false; error: string } {
  const email = value.trim()
  if (!email) return { ok: false, error: "Email is required." }
  if (email.length > EMAIL_MAX_LENGTH) return { ok: false, error: "Email is too long." }
  if (!EMAIL_REGEX.test(email)) return { ok: false, error: "Please enter a valid email address." }
  return { ok: true, email }
}

export function validatePasswordSignUp(value: string): { ok: true } | { ok: false; error: string } {
  const p = value
  if (p.length < PASSWORD_MIN_LENGTH)
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` }
  if (p.length > PASSWORD_MAX_LENGTH)
    return { ok: false, error: `Password must be no more than ${PASSWORD_MAX_LENGTH} characters.` }
  if (!/[a-zA-Z]/.test(p)) return { ok: false, error: "Password must include at least one letter." }
  if (!/\d/.test(p)) return { ok: false, error: "Password must include at least one number." }
  return { ok: true }
}

export function validatePasswordSignIn(value: string): { ok: true } | { ok: false; error: string } {
  if (!value || !value.trim()) return { ok: false, error: "Password is required." }
  return { ok: true }
}
