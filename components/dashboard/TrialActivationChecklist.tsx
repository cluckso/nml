"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Phone, PhoneForwarded, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trialActivationGoal } from "@/lib/trial-marketing"

type TrialActivationChecklistProps = {
  onboardingComplete: boolean
  hasAgent: boolean
  hasForwardingNumber: boolean
  /** True when a completed call or test verification landed (or owner acknowledged forwarding). */
  forwardingReady: boolean
  hasCalls: boolean
  isEnded: boolean
}

export function TrialActivationChecklist({
  onboardingComplete,
  hasAgent,
  hasForwardingNumber,
  forwardingReady,
  hasCalls,
  isEnded,
}: TrialActivationChecklistProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [acking, setAcking] = useState(false)

  if (isEnded) return null

  const hasNumber = hasForwardingNumber || hasAgent
  const forwardDone = forwardingReady || acknowledged || hasCalls

  const steps = [
    {
      id: "onboarding",
      label: "Add your business details",
      done: onboardingComplete,
      hint: onboardingComplete ? null : "Industry, name, and hours — takes about 2 minutes.",
    },
    {
      id: "connect",
      label: "Get your forwarding number",
      done: hasNumber,
      hint: hasNumber
        ? null
        : "Your forwarding number appears on the dashboard after onboarding — or click Get number in the setup card.",
    },
    {
      id: "forward",
      label: "Forward your business line",
      done: hasNumber && forwardDone,
      hint:
        hasNumber && !forwardDone
          ? "Set call forwarding at your carrier to the number on your dashboard, then confirm below or place a test call."
          : null,
    },
    {
      id: "first-call",
      label: "Capture your first lead",
      done: hasCalls,
      hint: hasCalls
        ? null
        : "Once a real call completes, you'll get a text or email summary — that's the moment most owners decide to upgrade.",
    },
  ]

  const allDone = steps.every((s) => s.done)
  if (allDone) return null

  const nextStep = steps.find((s) => !s.done)

  async function acknowledgeForwarding() {
    setAcking(true)
    try {
      const res = await fetch("/api/business/acknowledge-forwarding", { method: "POST" })
      if (res.ok) {
        setAcknowledged(true)
      }
    } finally {
      setAcking(false)
    }
  }

  return (
    <Card className="mb-8 border-amber-500/25 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Go live in 4 steps
        </CardTitle>
        <CardDescription>{trialActivationGoal()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-3 text-sm">
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
              )}
              <div>
                <span className={step.done ? "text-muted-foreground line-through" : "font-medium"}>
                  {step.label}
                </span>
                {step.hint && !step.done && (
                  <p className="text-muted-foreground mt-0.5">{step.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {nextStep && (
          <div className="flex flex-wrap gap-2 pt-2">
            {!onboardingComplete && (
              <Button size="sm" asChild>
                <Link href="/onboarding">Add business details</Link>
              </Button>
            )}
            {onboardingComplete && !hasNumber && (
              <Button size="sm" asChild>
                <a href="#setup">
                  <Phone className="h-4 w-4 mr-2" />
                  Get forwarding number
                </a>
              </Button>
            )}
            {hasNumber && !forwardDone && (
              <>
                <Button size="sm" onClick={acknowledgeForwarding} disabled={acking}>
                  {acking ? "Saving…" : "I've set up forwarding"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="#setup">
                    <PhoneForwarded className="h-4 w-4 mr-2" />
                    See forwarding steps
                  </a>
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
