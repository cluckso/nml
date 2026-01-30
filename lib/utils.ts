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
