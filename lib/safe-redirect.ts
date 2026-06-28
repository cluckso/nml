/** Allow only same-origin relative paths (no protocol-relative or external URLs). */
export function getSafeRedirectPath(next: string | null | undefined): string | null {
  if (!next || typeof next !== "string") return null
  const trimmed = next.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null
  if (trimmed.includes("://")) return null
  return trimmed
}
