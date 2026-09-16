import { customerCountLabel, CUSTOMER_COUNT } from "@/lib/marketing/social-proof"

export function CustomerCountBadge() {
  const label = customerCountLabel()

  if (!label || CUSTOMER_COUNT == null) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex -space-x-2" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="h-8 w-8 rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground flex items-center justify-center"
            >
              —
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Customer count and photos go here once we have permission to show them — no fake
          &quot;trusted by 1,000&quot; number.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <div className="flex -space-x-2" aria-hidden>
        {Array.from({ length: Math.min(12, CUSTOMER_COUNT) }).map((_, i) => (
          <span
            key={i}
            className="h-8 w-8 rounded-full border-2 border-background bg-primary/15 text-[10px] font-medium text-primary flex items-center justify-center"
          >
            {i + 1}
          </span>
        ))}
      </div>
      <p className="text-sm font-medium text-foreground/90">{label}</p>
    </div>
  )
}
