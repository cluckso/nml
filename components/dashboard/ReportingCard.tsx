import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Mail } from "lucide-react"
import { PLAN_HIGH_VOLUME } from "@/lib/plan-labels"

type TagCount = { tag: string; count: number }

interface ReportingCardProps {
  weekCalls: number
  weekMinutes: number
  leadsByTag: TagCount[]
}

export function ReportingCard({ weekCalls, weekMinutes, leadsByTag }: ReportingCardProps) {
  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Reporting dashboard
        </CardTitle>
        <CardDescription>Last 7 days · {PLAN_HIGH_VOLUME} plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Calls this week</p>
            <p className="text-2xl font-bold">{weekCalls}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Minutes this week</p>
            <p className="text-2xl font-bold">{Math.ceil(weekMinutes)}</p>
          </div>
        </div>
        {leadsByTag.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-2">Leads by tag</p>
            <ul className="space-y-1 text-sm">
              {leadsByTag.map(({ tag, count }) => (
                <li key={tag} className="flex justify-between text-muted-foreground">
                  <span>{tag}</span>
                  <span className="font-medium text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Lead tags will appear here as calls are captured.</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Weekly email reports are sent automatically. Customize in Settings → Reporting.
        </p>
      </CardContent>
    </Card>
  )
}
