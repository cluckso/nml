import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Zap } from "lucide-react"
import type { TrialStatus } from "@/lib/trial"
import { FREE_TRIAL_MINUTES } from "@/lib/plans"

interface TrialCardProps {
  trial: TrialStatus
  hasAgent: boolean
}

export function TrialCard({ trial, hasAgent }: TrialCardProps) {
  const { minutesRemaining, minutesUsed, isExhausted, isExpired, daysRemaining } = trial
  const percentUsed = FREE_TRIAL_MINUTES > 0 ? (minutesUsed / FREE_TRIAL_MINUTES) * 100 : 0
  const isEnded = isExhausted || isExpired
  const warningLow = minutesRemaining <= 5 && minutesRemaining > 0
  const warningEighty = percentUsed >= 80 && !isExhausted

  const description = () => {
    if (isExpired && !isExhausted)
      return "Your trial has ended. Upgrade to a plan to reactivate your number and keep capturing leads."
    if (isExhausted)
      return "You've used all 50 free minutes. Upgrade to keep receiving calls."
    if (isEnded) return "Your trial has ended. Upgrade to a plan to continue."
    return "50 call minutes or 4 days, whichever comes first. No charge until you upgrade. One trial per business number."
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
          <Zap className="h-5 w-5" />
          Your free trial
        </CardTitle>
        <CardDescription>{description()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Minutes used</span>
            <span className="font-semibold">
              {Math.ceil(minutesUsed)} / {FREE_TRIAL_MINUTES}
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
              <span className="font-medium text-foreground">{Math.ceil(minutesRemaining)}</span> minutes remaining
              {daysRemaining > 0 && (
                <> · <span className="font-medium text-foreground">{daysRemaining}</span> days left</>
              )}
            </p>
          )}
          {isExpired && !isExhausted && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">Trial ended</p>
          )}
          {warningEighty && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              About {Math.ceil(minutesRemaining)} minutes left — upgrade to avoid interruption.
            </p>
          )}
          {warningLow && (
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              5 minutes left in your trial — upgrade to avoid interruption.
            </p>
          )}
        </div>

        {!hasAgent && !isEnded && (
          <p className="text-sm">
            Connect your call assistant below to start using your trial minutes. Forward your business line to the AI number and receive real calls.
          </p>
        )}

        {hasAgent && !isEnded && (
          <p className="text-sm text-muted-foreground">
            You&apos;re using your trial. Calls appear under <Link href="/calls" className="text-primary underline">Calls</Link>. Upgrade anytime from Billing.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!hasAgent && !isEnded && (
            <a href="#setup" className="inline-flex">
              <Button size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Connect call assistant
              </Button>
            </a>
          )}
          {isEnded ? (
            <Button size="sm" asChild>
              <Link href="/billing">Upgrade to keep receiving calls</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/billing">View Billing & Upgrade</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
