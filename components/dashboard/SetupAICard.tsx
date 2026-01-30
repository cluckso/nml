"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Phone, CheckCircle2, Loader2, Smartphone } from "lucide-react"
import type { TrialStatus } from "@/lib/trial"
import { formatPhoneForDisplay } from "@/lib/utils"

interface SetupAICardProps {
  hasAgent: boolean
  phoneNumber: string | null
  businessName: string
  /** Owner phone (optional) — shown in same card for reference */
  ownerPhone?: string | null
  /** When on free trial, show remaining minutes; when exhausted, disable connect */
  trialStatus?: TrialStatus
}

export function SetupAICard({ hasAgent, phoneNumber, businessName, ownerPhone, trialStatus }: SetupAICardProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const handleActivate = async () => {
    setCreating(true)
    setError(null)
    setWarning(null)
    try {
      const res = await fetch("/api/agents", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create AI")
      if (data.warning) setWarning(data.warning)
      router.refresh()
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  if (hasAgent && phoneNumber) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle2 className="h-5 w-5" />
            Your call assistant is connected
          </CardTitle>
          <CardDescription>
            Finish setup by forwarding your business line to the AI number below. Call alerts use the number in this card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Phone setup — both numbers in one place</p>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">1. Business line → forward to this AI number</p>
                <p className="text-xl font-mono font-semibold mt-1">{formatPhoneForDisplay(phoneNumber) || phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  In your phone provider&apos;s settings (or carrier app), set call forwarding to this number. Incoming calls will be answered by your AI; you&apos;ll get a summary by email.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Want the AI to answer only when you don&apos;t pick up? At your carrier, use <strong>conditional</strong> or <strong>no-answer</strong> forwarding (e.g. forward after 4–5 rings) instead of &quot;forward all.&quot; See <Link href="/docs/faq" className="text-primary underline">Help & FAQ</Link> for carrier steps.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  If this number doesn&apos;t work for real calls, you may be in Retell test mode — use a live Retell account with billing for a callable number.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">2. Call summaries by email</p>
                <p className="font-semibold mt-1">Sent to your account email</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Call summaries are sent by email to the address you signed up with.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            New calls appear under <Link href="/calls" className="text-primary underline">Calls</Link>. Forward your business line to the AI number above to go live.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (hasAgent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            AI created
          </CardTitle>
          <CardDescription>
            Your AI receptionist is set up. If you don&apos;t see a number, we couldn&apos;t purchase one — check Retell billing and RETELL_DEFAULT_AREA_CODE, or add a number in the Retell dashboard.
          </CardDescription>
        </CardHeader>
        {warning && (
          <CardContent>
            <p className="rounded-md bg-amber-100 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">{warning}</p>
          </CardContent>
        )}
      </Card>
    )
  }

  const trialExhausted = trialStatus?.isExhausted ?? false
  const trialExpired = trialStatus?.isExpired ?? false
  const trialEnded = trialExhausted || trialExpired
  const onTrial = trialStatus?.isOnTrial ?? false

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Connect your call assistant</CardTitle>
        <CardDescription>
          Connect once to get your AI number and set both your business line and alert number in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {onTrial && !trialEnded && (
          <p className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
            You&apos;re on the free trial ({Math.ceil(trialStatus?.minutesRemaining ?? 0)} minutes remaining{trialStatus?.daysRemaining != null && trialStatus.daysRemaining > 0 ? `, ${trialStatus.daysRemaining} days left` : ""}). Upgrade from <Link href="/billing" className="text-primary underline">Billing</Link> when you&apos;re ready.
          </p>
        )}
        {trialEnded && (
          <p className="rounded-md bg-amber-100 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
            {trialExpired ? "Your trial has ended." : "Free trial minutes used."} <Link href="/billing" className="font-medium underline">Upgrade to a plan</Link> to connect your call assistant.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          We&apos;ll create your AI and assign a dedicated phone number. Then you&apos;ll forward your business line to that number. Call summaries are sent by email. No need to enter an AI number — we&apos;ll show it here after you connect.
        </p>
        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {trialEnded ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/billing">Upgrade to connect</Link>
          </Button>
        ) : (
          <Button
            onClick={handleActivate}
            disabled={creating}
            className="w-full sm:w-auto"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect to my call assistant"
            )}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          In development you can connect without a subscription. In production, subscribe or use your free trial from <Link href="/billing" className="text-primary underline">Billing</Link>.
        </p>
      </CardContent>
    </Card>
  )
}
