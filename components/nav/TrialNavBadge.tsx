import Link from "next/link"
import { cn } from "@/lib/utils"
import type { TrialNavBadge as TrialNavBadgeData } from "@/lib/trial-nav-badge"

const VARIANT_STYLES = {
  default:
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/15",
  urgent:
    "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
} as const

export function TrialNavBadge({ badge }: { badge: TrialNavBadgeData }) {
  return (
    <Link
      href={badge.href}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors",
        VARIANT_STYLES[badge.variant]
      )}
    >
      {badge.label}
    </Link>
  )
}
