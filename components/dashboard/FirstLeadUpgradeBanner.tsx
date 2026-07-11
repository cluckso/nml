import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { midTrialUpgradeNudgeLine, upgradeKeepAnsweringLabel } from "@/lib/trial-marketing"
import { Sparkles } from "lucide-react"

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
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/billing#plans">{upgradeKeepAnsweringLabel()}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/calls">Review calls</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
