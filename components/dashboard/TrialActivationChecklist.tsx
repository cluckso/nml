"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Phone, PhoneForwarded, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trialDaysLabel } from "@/lib/trial-marketing"

type TrialActivationChecklistProps = {
  onboardingComplete: boolean
  hasAgent: boolean
  hasCalls: boolean
  isEnded: boolean
}

export function TrialActivationChecklist({
  onboardingComplete,
  hasAgent,
  hasCalls,
  isEnded,
}: TrialActivationChecklistProps) {
  if (isEnded) return null

  const steps = [
    {
      id: "onboarding",
      label: "Complete business setup",
      done: onboardingComplete,
      hint: onboardingComplete ? null : "Finish industry and business details in onboarding.",
    },
    {
      id: "connect",
      label: "Connect your call assistant",
      done: hasAgent,
      hint: hasAgent ? null : "Create your AI line from the setup card below.",
    },
    {
      id: "forward",
      label: "Forward your business line",
      done: hasAgent && hasCalls,
      hint: hasAgent && !hasCalls ? "Set carrier forwarding to your CallGrabbr number (see setup card)." : null,
    },
    {
      id: "first-call",
      label: "Receive your first real call",
      done: hasCalls,
      hint: hasCalls ? null : `Your ${trialDaysLabel()} trial minutes count when real calls come in.`,
    },
  ]

  const allDone = steps.every((s) => s.done)
  if (allDone) return null

  const nextStep = steps.find((s) => !s.done)

  return (
    <Card className="mb-8 border-amber-500/25 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Get your first call — quick checklist
        </CardTitle>
        <CardDescription>
          Most owners convert after one captured lead. Complete these steps to use your trial minutes.
        </CardDescription>
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
                <Link href="/onboarding">Finish setup</Link>
              </Button>
            )}
            {onboardingComplete && !hasAgent && (
              <Button size="sm" asChild>
                <a href="#setup">
                  <Phone className="h-4 w-4 mr-2" />
                  Connect assistant
                </a>
              </Button>
            )}
            {hasAgent && !hasCalls && (
              <Button size="sm" variant="outline" asChild>
                <a href="#setup">
                  <PhoneForwarded className="h-4 w-4 mr-2" />
                  Forwarding steps
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
