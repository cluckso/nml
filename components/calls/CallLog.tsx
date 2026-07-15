import { Call } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ChevronRight, Phone } from "lucide-react"
import { formatPhoneForDisplay, toTelHref } from "@/lib/utils"
import { CallRecordingPlayer } from "@/components/calls/CallRecordingPlayer"

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
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Forward your business line to your CallGrabbr number — your first captured lead shows up here.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button size="sm" asChild>
              <Link href="/dashboard#setup">Finish setup</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/docs/faq">Forwarding guide</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {calls.map((call) => {
        const telHref = toTelHref(call.callerPhone)
        const phoneLabel =
          formatPhoneForDisplay(call.callerPhone) || call.callerPhone?.trim() || null

        return (
          <Card
            key={call.id}
            className="hover:bg-muted/50 hover:border-border transition-colors group"
          >
            <CardContent className="py-4 px-4">
              <div className="flex items-start gap-3">
                <Link href={`/calls/${call.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      {call.callerName || "Unknown caller"}
                    </p>
                    {call.emergencyFlag && (
                      <Badge variant="destructive" className="text-xs">
                        Emergency
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {phoneLabel || "No phone"}
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
                </Link>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {call.recordingUrl && (
                    <CallRecordingPlayer url={call.recordingUrl} compact />
                  )}
                  <div className="flex items-center gap-2">
                    {telHref && (
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <a href={telHref} aria-label={`Call ${call.callerName || phoneLabel || "lead"}`}>
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          Call
                        </a>
                      </Button>
                    )}
                    <Link
                      href={`/calls/${call.id}`}
                      className="p-1.5 text-muted-foreground group-hover:text-foreground transition-colors"
                      aria-label="View call details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
