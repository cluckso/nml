"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Phone, PhoneForwarded, Rocket, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trialActivationGoal } from "@/lib/trial-marketing"

type TrialActivationChecklistProps = {
  /** Trial clock started (always true when this checklist is shown on an active trial). */
  trialStarted: boolean
  onboardingComplete: boolean
  greetingPreviewed: boolean
  hasAgent: boolean
  hasForwardingNumber: boolean
  /** True when a completed call or test verification landed. */
  forwardingReady: boolean
  hasCalls: boolean
  isEnded: boolean
}

export function TrialActivationChecklist({
  trialStarted,
  onboardingComplete,
  greetingPreviewed,
  hasAgent,
  hasForwardingNumber,
  forwardingReady,
  hasCalls,
  isEnded,
}: TrialActivationChecklistProps) {
  if (isEnded) return null

  const hasNumber = hasForwardingNumber || hasAgent
  const forwardDone = forwardingReady || hasCalls

  const steps = [
    {
      id: "trial",
      label: "Start trial",
      done: trialStarted,
      hint: null as string | null,
    },
    {
      id: "onboarding",
      label: "Add your business details",
      done: onboardingComplete,
      hint: onboardingComplete ? null : "Industry, name, and service area — under a minute.",
    },
    {
      id: "greeting",
      label: "Preview your AI greeting",
      done: greetingPreviewed,
      hint: greetingPreviewed
        ? null
        : "Hear pronunciation and opening line — builds confidence before you forward your number.",
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
      label: "Make your first test call",
      done: hasNumber && forwardDone,
      hint:
        hasNumber && !forwardDone
          ? "Set call forwarding at your carrier, then dial yourself to hear the greeting and capture a lead."
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

  const doneCount = steps.filter((s) => s.done).length
  const nextStep = steps.find((s) => !s.done)

  return (
    <Card className="mb-8 border-amber-500/25 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Next steps after trial start
        </CardTitle>
        <CardDescription>
          {trialActivationGoal()}{" "}
          <span className="text-foreground/80 font-medium">
            {doneCount}/{steps.length} complete
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-label="Trial activation progress"
        >
          <div
            className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
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
            {nextStep.id === "onboarding" && (
              <Button size="sm" asChild>
                <Link href="/onboarding">Add business details</Link>
              </Button>
            )}
            {nextStep.id === "greeting" && (
              <Button size="sm" asChild>
                <a href="#preview-greeting">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Preview greeting
                </a>
              </Button>
            )}
            {nextStep.id === "connect" && (
              <Button size="sm" asChild>
                <a href="#setup">
                  <Phone className="h-4 w-4 mr-2" />
                  Get forwarding number
                </a>
              </Button>
            )}
            {(nextStep.id === "forward" || nextStep.id === "first-call") && (
              <Button size="sm" variant="outline" asChild>
                <a href="#setup">
                  <PhoneForwarded className="h-4 w-4 mr-2" />
                  See forwarding steps
                </a>
              </Button>
            )}
            {nextStep.id === "greeting" && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/settings?section=greeting#preview-greeting">Open in Settings</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
