import { Call } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ChevronRight, Phone } from "lucide-react"

function formatPhone(phone: string | null): string {
  if (!phone || !phone.trim()) return "—"
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

interface CallLogProps {
  calls: Call[]
}

export function CallLog({ calls }: CallLogProps) {
  if (calls.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Phone className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No calls yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Calls will appear here once your AI answers
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {calls.map((call) => (
        <Link key={call.id} href={`/calls/${call.id}`}>
          <Card className="hover:bg-muted/50 hover:border-border transition-colors cursor-pointer group">
            <CardContent className="py-4 px-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      {call.callerName || "Unknown caller"}
                    </p>
                    {call.emergencyFlag && (
                      <Badge variant="destructive" className="text-xs">Emergency</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatPhone(call.callerPhone) || "No phone"}
                  </p>
                  {call.issueDescription && (
                    <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                      {call.issueDescription}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(call.createdAt, { addSuffix: true })}
                    {" · "}
                    {Math.floor(call.minutes)}m {Math.round((call.minutes % 1) * 60)}s
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
