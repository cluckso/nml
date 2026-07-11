import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { midTrialUpgradeNudgeLine, upgradeKeepAnsweringLabel } from "@/lib/trial-marketing"
import { Gift, Sparkles } from "lucide-react"

export function FirstLeadUpgradeBanner({ callCount }: { callCount: number }) {
  if (callCount < 1) return null

  return (
    <Card className="mb-8 border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          It&apos;s working — don&apos;t turn it off
        </CardTitle>
        <CardDescription>
          You&apos;ve had {callCount} call{callCount === 1 ? "" : "s"} on your trial — that&apos;s exactly what
          you&apos;d lose if the line goes unanswered again. {midTrialUpgradeNudgeLine()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/billing#plans">{upgradeKeepAnsweringLabel()}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calls">Review calls</Link>
          </Button>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/80 p-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
            <span>
              Know another contractor? Share your referral link and earn <strong>$50</strong> credit when they
              subscribe.
            </span>
          </p>
          <Button size="sm" variant="secondary" asChild>
            <a href="#referral">Get referral link</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
