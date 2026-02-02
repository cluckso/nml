import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getIntakeNumberForIndustry, hasIntakeNumberConfigured } from "@/lib/intake-routing"
import { formatPhoneForDisplay } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const user = await requireAuth()
  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
      })
    : null

  const intakeNumber = getIntakeNumberForIndustry(business?.industry ?? null)
  const showIntakeNumber = hasIntakeNumberConfigured() && intakeNumber

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            AI call number (forward to)
          </CardTitle>
          <CardDescription>
            Forward your business line to this number so the AI answers. Call summaries are sent by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showIntakeNumber ? (
            <>
              <p className="text-2xl font-mono font-semibold">{formatPhoneForDisplay(intakeNumber) || intakeNumber}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Set call forwarding at your carrier to this number. See{" "}
                <Link href="/docs/faq" className="text-primary underline">
                  Help & FAQ
                </Link>{" "}
                for carrier steps.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Intake number not configured for your account. Contact support or check your dashboard after connecting your call assistant.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
