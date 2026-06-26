import { Card, CardContent } from "@/components/ui/card"
import { Industry } from "@prisma/client"
import { calculatePotentialRevenue, formatCurrency, getAverageJobValue } from "@/lib/industry-data"
import { DollarSign, TrendingUp } from "lucide-react"

interface ROICardProps {
  leadsThisMonth: number
  industry: Industry
}

export function ROICard({ leadsThisMonth, industry }: ROICardProps) {
  const avgJob = getAverageJobValue(industry)
  const potentialRevenue = calculatePotentialRevenue(leadsThisMonth, industry)

  return (
    <Card className="border-emerald-500/30 bg-emerald-950/20 md:col-span-3">
      <CardContent className="pt-5 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="rounded-lg bg-emerald-500/15 p-2.5 shrink-0">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Revenue saved this month
            </p>
            <p className="text-lg sm:text-xl font-bold tracking-tight mt-1">
              {leadsThisMonth === 0 ? (
                "Your first captured lead will show up here"
              ) : (
                <>
                  <span className="text-emerald-400">{leadsThisMonth}</span> lead{leadsThisMonth !== 1 ? "s" : ""} captured
                  {" · "}
                  up to <span className="text-emerald-400">{formatCurrency(potentialRevenue)}</span> in potential revenue
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Based on {formatCurrency(avgJob)} average job value for your industry. One booked job often pays for months of service.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
