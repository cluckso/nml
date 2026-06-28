import Link from "next/link"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PlanUsageNudge } from "@/lib/plan-usage"

export function UsageUpgradeNudge({ nudge }: { nudge: PlanUsageNudge }) {
  if (!nudge.show) return null

  const isWarning = nudge.severity === "warning"
  const Icon = isWarning ? AlertTriangle : TrendingUp

  return (
    <div
      className={`rounded-lg border p-4 ${
        isWarning
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-primary/30 bg-primary/5"
      }`}
      role="status"
    >
      <div className="flex gap-3">
        <Icon
          className={`h-5 w-5 shrink-0 mt-0.5 ${isWarning ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}
          aria-hidden
        />
        <div className="flex-1 min-w-0 space-y-2">
          <p className="font-medium text-sm">{nudge.title}</p>
          <p className="text-sm text-muted-foreground">{nudge.message}</p>
          <Button asChild size="sm" variant={isWarning ? "default" : "outline"}>
            <Link href={nudge.ctaHref}>{nudge.ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
