import { BadgeCheck, Headphones, Lock, Star } from "lucide-react"

const TRUST_ITEMS = [
  { icon: Star, label: "Built for local trades" },
  { icon: Headphones, label: "24/7 call coverage" },
  { icon: Lock, label: "Your data stays yours" },
  { icon: BadgeCheck, label: "Professional voice" },
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
