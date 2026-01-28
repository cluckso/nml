import { Call } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface CallLogProps {
  calls: Call[]
}

export function CallLog({ calls }: CallLogProps) {
  if (calls.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No calls yet
        </CardContent>
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
