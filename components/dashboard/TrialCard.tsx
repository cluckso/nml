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
  const { minutesRemaining, minutesUsed, isExhausted } = trial
  const percentUsed = FREE_TRIAL_MINUTES > 0 ? (minutesUsed / FREE_TRIAL_MINUTES) * 100 : 0

  return (
    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
          <Zap className="h-5 w-5" />
          Your free trial
        </CardTitle>
        <CardDescription>
          {isExhausted
            ? "You've used all 100 free minutes. Upgrade to keep receiving calls."
            : "100 call minutes to try real AI answering — no time limit, no credit card for trial."}
        </CardDescription>
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
            </p>
          )}
        </div>

        {!hasAgent && !isExhausted && (
          <p className="text-sm">
            Connect your call assistant below to start using your trial minutes. Forward your business line to the AI number and receive real calls.
          </p>
        )}

        {hasAgent && !isExhausted && (
          <p className="text-sm text-muted-foreground">
            You&apos;re using your trial. Calls appear under <Link href="/calls" className="text-primary underline">Calls</Link>. Upgrade anytime from Billing.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!hasAgent && !isExhausted && (
            <a href="#setup" className="inline-flex">
              <Button size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Connect call assistant
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/billing">View Billing & Upgrade</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
