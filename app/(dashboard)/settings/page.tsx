import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getIntakeNumberForIndustry } from "@/lib/intake-routing"
import { formatPhoneForDisplay } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone } from "lucide-react"
import Link from "next/link"
import { SettingsClient } from "@/components/settings/SettingsClient"

export default async function SettingsPage() {
  let user
  try {
    user = await requireAuth()
  } catch (err) {
    console.error("Settings page auth error:", err)
    const msg = err instanceof Error ? err.message : ""
    const isSchema = /column|Unknown arg|does not exist/i.test(msg)
    if (isSchema) {
      return (
        <div className="container mx-auto max-w-2xl py-12 px-4 text-center">
          <h1 className="text-xl font-semibold mb-2">Configuration update required</h1>
          <p className="text-muted-foreground mb-4">
            The database is missing recent updates. Please run the migration <code className="text-sm bg-muted px-1 rounded">prisma/add_sms_consent.sql</code> in your database (e.g. Supabase SQL editor), then refresh.
          </p>
          <Link href="/dashboard" className="text-primary underline">Back to dashboard</Link>
        </div>
      )
    }
    throw err
  }

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
      })
    : null

  const intakeNumber = business?.retellPhoneNumber || getIntakeNumberForIndustry(business?.industry ?? null)

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* AI Number Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            AI call number (forward to)
          </CardTitle>
          <CardDescription>
            Forward your business line to this number so the AI answers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {intakeNumber ? (
            <p className="text-xl font-mono font-semibold">{formatPhoneForDisplay(intakeNumber) || intakeNumber}</p>
          ) : (
            <p className="text-muted-foreground text-sm">Not configured yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Full settings panel */}
      <SettingsClient />
    </div>
  )
}
