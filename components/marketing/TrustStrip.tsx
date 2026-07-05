import { Clock, DollarSign, Shield, TrendingUp } from "lucide-react"
import { trialDaysLabel } from "@/lib/trial-marketing"

const TRUST_ITEMS = [
  { icon: TrendingUp, label: "One job pays for months" },
  { icon: Clock, label: `${trialDaysLabel()} free trial · no card` },
  { icon: DollarSign, label: "From $99/mo · no setup fee" },
  { icon: Shield, label: "Cancel anytime" },
] as const

export function TrustStrip() {
  return (
    <div className="border-y border-border/40 bg-card/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-medium text-foreground/90">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
