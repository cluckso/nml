import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"

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

  const intake = call.structuredIntake as any

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Call Details</h1>
        {call.emergencyFlag && (
          <Badge variant="destructive" className="mt-2">
            🚨 Emergency
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Caller Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {call.callerName || "Not provided"}
            </div>
            <div>
              <span className="font-semibold">Phone:</span> {call.callerPhone || "Not provided"}
            </div>
            {intake?.address && (
              <div>
                <span className="font-semibold">Address:</span> {intake.address}
              </div>
            )}
            {intake?.city && (
              <div>
                <span className="font-semibold">City:</span> {intake.city}
              </div>
            )}
          </CardContent>
        </Card>

        {call.issueDescription && (
          <Card>
            <CardHeader>
              <CardTitle>Issue Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{call.issueDescription}</p>
            </CardContent>
          </Card>
        )}

        {call.transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{call.transcript}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Duration:</span> {Math.floor(call.minutes)} minutes {Math.round((call.minutes % 1) * 60)} seconds
            </div>
            <div>
              <span className="font-semibold">Date:</span> {new Date(call.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Call ID:</span> {call.retellCallId}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
