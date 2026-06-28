"use client"

import { useMemo, useState } from "react"
import type { FunnelConfig } from "@/lib/funnel/funnel-config"
import { calculateFunnelRoi } from "@/lib/funnel/roi-calculator"
import { formatCurrency } from "@/lib/industry-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { getCallsPerWeekFromVolume } from "./FunnelStepForm"

interface FunnelRoiCalculatorProps {
  config: FunnelConfig
  callVolume?: string
  className?: string
}

export function FunnelRoiCalculator({ config, callVolume, className = "" }: FunnelRoiCalculatorProps) {
  const [manualCalls, setManualCalls] = useState(35)

  const callsPerWeek = callVolume ? getCallsPerWeekFromVolume(callVolume) : manualCalls

  const roi = useMemo(
    () =>
      calculateFunnelRoi({
        callsPerWeek,
        averageSale: config.averageSale,
        missedCallRate: config.missedCallRate,
      }),
    [callsPerWeek, config.averageSale, config.missedCallRate]
  )

  return (
    <Card className={`border-border/50 bg-card/60 backdrop-blur ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Missed-call revenue estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!callVolume && (
          <div className="space-y-2">
            <label htmlFor="roi-calls" className="text-sm text-muted-foreground">
              Inbound calls per week (estimate)
            </label>
            <input
              id="roi-calls"
              type="range"
              min={10}
              max={150}
              step={5}
              value={manualCalls}
              onChange={(e) => setManualCalls(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-sm font-medium">{manualCalls} calls/week</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <p className="text-muted-foreground mb-1">Lost monthly</p>
            <p className="text-xl font-bold text-destructive">
              {formatCurrency(roi.missedRevenuePerMonth)}
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-muted-foreground mb-1">Recoverable with CallGrabbr</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(roi.recoveredRevenuePerMonth)}/mo
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Based on {Math.round(config.missedCallRate * 100)}% missed-call rate, avg job{" "}
          {formatCurrency(config.averageSale)}, and 85% capture rate. One recovered lead often pays
          for months of service.
        </p>
      </CardContent>
    </Card>
  )
}
