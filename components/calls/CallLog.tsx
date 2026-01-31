import { Call } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface CallLogProps {
  calls: Call[]
  /** Compact rows for dashboard control board */
  compact?: boolean
}

export function CallLog({ calls, compact }: CallLogProps) {
  if (calls.length === 0) {
    return (
      <Card className={compact ? "py-4" : ""}>
        <CardContent className={compact ? "py-6 text-center text-sm text-muted-foreground" : "py-8 text-center text-muted-foreground"}>
          No calls yet
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card>
        <div className="divide-y divide-border">
          {calls.map((call) => (
            <Link key={call.id} href={`/calls/${call.id}`} className="block hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between gap-3 py-2 px-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{call.callerName || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground truncate">{call.callerPhone || "—"} · {call.issueDescription ? `${call.issueDescription.slice(0, 40)}${call.issueDescription.length > 40 ? "…" : ""}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                  {call.emergencyFlag && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>}
                  <span>{formatDistanceToNow(call.createdAt, { addSuffix: true })}</span>
                  <span>{Math.floor(call.minutes)}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <Link key={call.id} href={`/calls/${call.id}`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {call.callerName || "Unknown Caller"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {call.callerPhone || "No phone"}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {call.emergencyFlag && (
                    <Badge variant="destructive">🚨 Emergency</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(call.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {call.issueDescription && (
                <p className="text-sm line-clamp-2">{call.issueDescription}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {Math.floor(call.minutes)}m {Math.round((call.minutes % 1) * 60)}s
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
