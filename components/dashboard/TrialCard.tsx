import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Zap } from "lucide-react"
import type { TrialStatus } from "@/lib/trial"
import { FREE_TRIAL_MINUTES } from "@/lib/plans"
import { approxCallsPerMonth } from "@/lib/plan-usage"
import { trialDaysLabel, upgradeKeepAnsweringLabel, upgradeTrialEndedLabel } from "@/lib/trial-marketing"

interface TrialCardProps {
  trial: TrialStatus
  hasAgent: boolean
}

export function TrialCard({ trial, hasAgent }: TrialCardProps) {
  const { minutesRemaining, minutesUsed, isExhausted, isExpired, daysRemaining } = trial
  const approxCalls = approxCallsPerMonth(FREE_TRIAL_MINUTES)
  const percentUsed = FREE_TRIAL_MINUTES > 0 ? (minutesUsed / FREE_TRIAL_MINUTES) * 100 : 0
  const isEnded = isExhausted || isExpired
  const warningLow = minutesRemaining <= 5 && minutesRemaining > 0
  const warningEighty = percentUsed >= 80 && !isExhausted

  const description = () => {
    if (isExpired && !isExhausted)
      return "Your trial window ended. Upgrade to turn your assistant back on — one captured job often covers months of service."
    if (isExhausted)
      return "Trial minutes used up. Upgrade to keep answering calls you would have missed."
    if (isEnded) return "Trial ended. Pick a plan to keep capturing leads."
    return `${trialDaysLabel()} trial · ~${approxCalls} real calls included · No charge until you upgrade.`
  }

  return (
    <Card className="glass-card border-emerald-500/20 bg-emerald-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
          <Zap className="h-5 w-5" />
          Free trial — test with real calls
        </CardTitle>
        <CardDescription>{description()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Trial usage</span>
            <span className="font-semibold">
              {Math.ceil(minutesUsed)} / {FREE_TRIAL_MINUTES} min
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="h-3 rounded-full bg-emerald-600 transition-all"
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
          {!isExhausted && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{Math.ceil(minutesRemaining)}</span> min left
              {daysRemaining > 0 && (
                <> · <span className="font-medium text-foreground">{daysRemaining}</span> days left</>
              )}
            </p>
          )}
          {isExpired && !isExhausted && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">Trial period ended</p>
          )}
          {warningEighty && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              Running low — upgrade so the next call still gets answered.
            </p>
          )}
          {warningLow && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              Almost out of trial minutes — don&apos;t let the next missed call go unanswered.
            </p>
          )}
        </div>

        {!hasAgent && !isEnded && (
          <p className="text-sm">
            Connect your call assistant below, forward your business line, and make a test call. That&apos;s when the trial really starts.
          </p>
        )}

        {hasAgent && !isEnded && !trial.minutesUsed && (
          <p className="text-sm text-muted-foreground">
            Assistant connected — forward your line and place a test call. Captured leads show up under{" "}
            <Link href="/calls" className="text-primary underline">Calls</Link>.
          </p>
        )}

        {hasAgent && !isEnded && trial.minutesUsed > 0 && (
          <p className="text-sm text-muted-foreground">
            Calls are coming in —{" "}
            <Link href="/billing" className="text-primary underline font-medium">
              keep your assistant on
            </Link>{" "}
            after the trial so you don&apos;t miss the next one.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!hasAgent && !isEnded && (
            <a href="#setup" className="inline-flex">
              <Button size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Connect assistant
              </Button>
            </a>
          )}
          {isEnded ? (
            <Button size="sm" asChild>
              <Link href="/billing">{upgradeTrialEndedLabel()}</Link>
            </Button>
          ) : (
            hasAgent && trial.minutesUsed > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/billing">{upgradeKeepAnsweringLabel()}</Link>
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
