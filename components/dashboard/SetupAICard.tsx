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
  /** Dedicated Retell agent + number assigned to this business. */
  hasAgent: boolean
  /** Number to forward to (dedicated or shared intake fallback). */
  phoneNumber: string | null
  /** True when the business still needs its own dedicated line provisioned. */
  needsDedicatedLine?: boolean
  trialStatus?: TrialStatus
  compact?: boolean
}

export function SetupAICard({
  hasAgent,
  phoneNumber,
  needsDedicatedLine = !hasAgent,
  trialStatus,
  compact,
}: SetupAICardProps) {
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
      if (!res.ok) throw new Error(data.error || "Failed to connect call assistant")
      if (data.warning) setWarning(data.warning)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  if (phoneNumber) {
    const title = hasAgent ? "Call assistant connected" : "Your forwarding number"
    const description = hasAgent
      ? "Forward your business line to the number below — then call yourself to confirm it works."
      : "Forward your business line to this number. Activate your dedicated line when you're ready to go live."

    if (compact) {
      return (
        <Card
          className={
            hasAgent
              ? "glass-card border-green-500/20 bg-green-950/10 py-3 px-4"
              : "glass-card border-primary/20 bg-primary/5 py-3 px-4"
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${hasAgent ? "text-green-600" : "text-primary"}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    hasAgent ? "text-green-800 dark:text-green-200" : "text-foreground"
                  }`}
                >
                  {title}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatPhoneForDisplay(phoneNumber) || phoneNumber}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {needsDedicatedLine && (
                <Button size="sm" className="h-8" onClick={handleActivate} disabled={creating}>
                  {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Activate line"}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                <Link href="/calls" className="text-primary underline">
                  Calls
                </Link>
                {" · "}
                <Link href="/docs/faq" className="text-primary underline">
                  Help
                </Link>
              </p>
            </div>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
          {warning && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">{warning}</p>
          )}
        </Card>
      )
    }

    return (
      <Card
        className={
          hasAgent
            ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
            : "border-primary/30 bg-primary/5"
        }
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${
              hasAgent ? "text-green-800 dark:text-green-200" : "text-foreground"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            {hasAgent ? "Your call assistant is connected" : "Your forwarding number"}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Phone setup — both numbers in one place</p>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">1. Business line → forward to this number</p>
                <p className="text-xl font-mono font-semibold mt-1">
                  {formatPhoneForDisplay(phoneNumber) || phoneNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  In your phone provider&apos;s settings (or carrier app), set call forwarding to this number. Incoming
                  calls will be answered by your call assistant; you&apos;ll get a summary by email.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set <strong>unconditional</strong> forwarding to this number, then use{" "}
                  <Link href="/settings" className="text-primary underline">
                    Settings → Call Routing
                  </Link>{" "}
                  to choose whether your assistant answers immediately or after a ring delay.
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
          {needsDedicatedLine && (
            <div className="space-y-2">
              {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              {warning && (
                <p className="rounded-md bg-amber-100 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
                  {warning}
                </p>
              )}
              <Button onClick={handleActivate} disabled={creating} className="w-full sm:w-auto">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating…
                  </>
                ) : (
                  "Activate my dedicated line"
                )}
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            New calls appear under <Link href="/calls" className="text-primary underline">Calls</Link>. Haven&apos;t
            forwarded yet? Do that now — your trial only counts when real calls come in.
          </p>
        </CardContent>
      </Card>
    )
  }

  const trialExhausted = trialStatus?.isExhausted ?? false
  const trialExpired = trialStatus?.isExpired ?? false
  const trialEnded = trialExhausted || trialExpired
  const onTrial = trialStatus?.isOnTrial ?? false

  if (compact && !phoneNumber) {
    return (
      <Card className="border-primary/30 bg-primary/5 py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Call assistant</p>
          {trialEnded ? (
            <Button size="sm" className="h-8" asChild>
              <Link href="/billing">Upgrade to connect</Link>
            </Button>
          ) : (
            <Button size="sm" className="h-8" onClick={handleActivate} disabled={creating}>
              {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Get number"}
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </Card>
    )
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Connect your call assistant</CardTitle>
        <CardDescription>
          One click gets your forwarding number. Set your carrier to forward missed calls — then test with a real call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {onTrial && !trialEnded && (
          <p className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
            Trial active
            {trialStatus?.daysRemaining != null && trialStatus.daysRemaining > 0
              ? ` · ${trialStatus.daysRemaining} days left`
              : ""}
            {trialStatus?.minutesRemaining != null && trialStatus.minutesRemaining > 0
              ? ` · ${Math.ceil(trialStatus.minutesRemaining)} min left`
              : ""}
            . Get your number below, forward your line, and make a test call — that&apos;s how you know if it&apos;s
            worth keeping.
          </p>
        )}
        {trialEnded && (
          <p className="rounded-md bg-amber-100 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
            {trialExpired ? "Your trial has ended." : "Free trial minutes used."}{" "}
            <Link href="/billing" className="font-medium underline">
              Upgrade to a plan
            </Link>{" "}
            to connect your call assistant.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Forward unanswered calls to your CallGrabbr number. You&apos;ll get lead summaries by text and email when
          callers share their details.
        </p>
        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {trialEnded ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/billing">Upgrade to connect</Link>
          </Button>
        ) : (
          <Button onClick={handleActivate} disabled={creating} className="w-full sm:w-auto">
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              "Get my forwarding number"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
