export function formatBlogDate(
  value: Date | string | null | undefined,
  month: "short" | "long" = "short"
): string | null {
  if (value == null) return null

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
  })
}
