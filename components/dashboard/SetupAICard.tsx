"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Phone, CheckCircle2, Loader2, Smartphone } from "lucide-react"
import type { TrialStatus } from "@/lib/trial"

interface SetupAICardProps {
  hasAgent: boolean
  phoneNumber: string | null
  businessName: string
  /** Owner phone for SMS alerts — shown in same card to avoid two-number confusion */
  ownerPhone?: string | null
  /** When on free trial, show remaining minutes; when exhausted, disable connect */
  trialStatus?: TrialStatus
}

export function SetupAICard({ hasAgent, phoneNumber, businessName, ownerPhone, trialStatus }: SetupAICardProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch("/api/agents", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create AI")
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
                <p className="text-xl font-mono font-semibold mt-1">{phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  In your phone provider&apos;s settings (or carrier app), set call forwarding to this number. Incoming calls will be answered by your AI; you&apos;ll get a summary by email and SMS.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">2. Your number for call alerts (SMS + email)</p>
                <p className="font-mono font-semibold mt-1">{ownerPhone || "Not set — add in onboarding or settings"}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Call summaries and alerts go here. You set this in onboarding; update it there if needed.
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
            Your AI receptionist is set up. If you don&apos;t see a number, connect one in your Retell dashboard or contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const trialExhausted = trialStatus?.isExhausted ?? false
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
        {onTrial && !trialExhausted && (
          <p className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
            You&apos;re on the free trial ({Math.ceil(trialStatus?.minutesRemaining ?? 0)} minutes remaining). Upgrade from <Link href="/billing" className="text-primary underline">Billing</Link> when you&apos;re ready.
          </p>
        )}
        {trialExhausted && (
          <p className="rounded-md bg-amber-100 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
            Free trial minutes used. <Link href="/billing" className="font-medium underline">Upgrade to a plan</Link> to connect your call assistant.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          We&apos;ll create your AI and (when available) assign a phone number. Then you&apos;ll forward your business line to that number and confirm where you want call alerts (SMS/email). No need to enter numbers in multiple spots — we&apos;ll show everything here after you connect.
        </p>
        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {trialExhausted ? (
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
