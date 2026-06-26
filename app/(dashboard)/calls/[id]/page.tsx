import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  CallItemizedReport,
  buildCallItemizedProps,
} from "@/components/calls/CallItemizedReport"
import { TranscriptCollapsible } from "@/components/calls/TranscriptCollapsible"
import { Button } from "@/components/ui/button"

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()

  if (!user.businessId) {
    notFound()
  }

  const call = await db.call.findFirst({
    where: {
      id,
      businessId: user.businessId,
    },
  })

  if (!call) {
    notFound()
  }

  const intake = call.structuredIntake as import("@/components/calls/CallItemizedReport").StructuredIntake | null
  const appointmentRequest = call.appointmentRequest as
    | { notes?: string; preferredDays?: string; preferredTime?: string }
    | null
  const itemizedProps = buildCallItemizedProps({
    createdAt: call.createdAt,
    callerName: call.callerName,
    callerPhone: call.callerPhone,
    issueDescription: call.issueDescription,
    structuredIntake: intake,
    appointmentRequest,
  })

  const formattedDate = new Date(call.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      <Link href="/calls">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to calls
        </Button>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {call.callerName || "Unknown Caller"}
          </h1>
          <p className="text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {call.emergencyFlag && (
            <Badge variant="destructive" className="font-medium">
              Emergency
            </Badge>
          )}
          <Badge variant="secondary" className="font-mono text-xs">
            {Math.floor(call.minutes)}m {Math.round((call.minutes % 1) * 60)}s
          </Badge>
        </div>
      </div>

      {/* Lead summary — facts first */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Lead Summary</CardTitle>
          <CardDescription>
            Name, contact, reason, and appointment preference from this call
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CallItemizedReport {...itemizedProps} />
        </CardContent>
      </Card>

      {/* Transcript — collapsible */}
      {call.transcript && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Transcript</CardTitle>
            <CardDescription>
              Full conversation — expand to read
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TranscriptCollapsible transcript={call.transcript} />
          </CardContent>
        </Card>
      )}

      {/* Call metadata — compact */}
      <div className="text-xs text-muted-foreground">
        Call ID: <span className="font-mono">{call.retellCallId}</span>
      </div>
    </div>
  )
}
