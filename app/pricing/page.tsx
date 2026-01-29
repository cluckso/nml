import { getCurrentUser } from "@/lib/auth"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for solo operators & small shops",
    features: [
      "Up to 500 call minutes",
      "AI answers calls during business hours or after-hours",
      "Captures caller name, number, and reason",
      "Sends call summaries via text or email",
      "Missed-call recovery",
      "Custom greeting with your business name",
    ],
  },
  {
    name: "Pro",
    description: "Best for growing service businesses",
    features: [
      "Up to 1,200 call minutes",
      "Everything in Starter, plus:",
      "Custom intake flows by service type",
      "Appointment request capture",
      "Emergency vs non-emergency routing",
      "SMS confirmation to callers",
      "Call transcripts + summaries",
      "Email / CRM forwarding",
    ],
  },
  {
    name: "Local Plus",
    description: "Built for high-volume trades",
    features: [
      "Up to 2,500 call minutes",
      "Priority call routing",
      "Multi-department logic",
      "After-hours emergency handling",
      "Lead tagging (emergency, estimate, follow-up)",
      "Weekly usage & lead reports",
      "Fully branded AI voice",
    ],
  },
]

export default async function PricingPage() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Simple, transparent pricing. No hidden fees. Cancel anytime.
        </p>
        <p className="mt-4 text-muted-foreground">
          Overage: $0.10/min after included minutes
        </p>
        {isLoggedIn && (
          <p className="mt-2 text-sm text-primary font-medium">
            Choose a plan below — then you&apos;ll set up your business details.
          </p>
        )}
      </div>

      <PricingPlansWithAgreement plans={PLANS} isLoggedIn={isLoggedIn} />

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Why This Pays for Itself</h2>
        <p className="text-lg text-muted-foreground mb-6">
          If you recover just one missed service call per month, the system covers its cost.
          Most customers recover 3–10 calls they were missing before.
        </p>
        <p className="text-muted-foreground">
          Don&apos;t talk tech. Talk results. This is revenue protection, not just call answering.
        </p>
      </div>
    </div>
  )
}
