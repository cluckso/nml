import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AVG_JOB_VALUE_LOW, AVG_JOB_VALUE_HIGH } from "@/lib/pricing-catalog"
import { Sparkles } from "lucide-react"

export function FirstLeadUpgradeBanner({ callCount }: { callCount: number }) {
  if (callCount < 1) return null

  return (
    <Card className="mb-8 border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your assistant is working — lock it in
        </CardTitle>
        <CardDescription>
          You&apos;ve received {callCount} call{callCount === 1 ? "" : "s"} on your trial. Average
          service jobs run ${AVG_JOB_VALUE_LOW.toLocaleString()}–$
          {AVG_JOB_VALUE_HIGH.toLocaleString()} — one lead can cover months of CallGrabbr.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/billing#plans">Upgrade to keep your number active</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
