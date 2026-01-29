import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { Button } from "@/components/ui/button"

const PLANS = [
  {
    name: "Basic",
    description: "Best for solo operators & small shops",
    features: [
      "Up to 500 call minutes / month",
      "24/7 AI call answering (business hours + after-hours logic)",
      "Caller name, phone number, and reason captured",
      "Call summaries via SMS and/or email",
      "Missed-call recovery",
      "Custom greeting with business name",
    ],
    annualPrice: 990,
    annualLabel: "2 months free, paid upfront",
  },
  {
    name: "Pro",
    description: "Best for growing service businesses",
    features: [
      "Up to 1,200 call minutes / month",
      "Everything in Basic, plus:",
      "Industry-optimized AI agents (select business type → prebuilt intake flow)",
      "Service-specific intake flows (plumbing, HVAC, electrical, etc.)",
      "Appointment request capture (date/time preferences)",
      "Emergency vs non-emergency detection and routing",
      "SMS confirmation to callers",
      "Full call transcripts + summaries",
      "Email and CRM forwarding",
    ],
  },
  {
    name: "Local Plus",
    description: "Built for high-volume, multi-department trades",
    features: [
      "Up to 2,500 call minutes / month",
      "Everything in Pro, plus:",
      "Priority call routing",
      "Multi-department logic (sales vs service, by trade, or by team)",
      "After-hours emergency handling with escalation logic",
      "Lead tagging (emergency, estimate, follow-up)",
      "Weekly usage & lead reports",
      "Fully branded AI voice (tone, pacing, greeting)",
    ],
  },
]

export default async function PricingPage() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">NeverMissLead — Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Simple, usage-based pricing built for service businesses.
        </p>
        <p className="mt-2 text-muted-foreground">
          No setup fees. No contracts. Cancel anytime.
        </p>
        <p className="mt-2 text-muted-foreground">
          Overage on all plans: $0.10/min after included minutes.
        </p>
        {isLoggedIn && (
          <p className="mt-2 text-sm text-primary font-medium">
            Choose a plan below — then you&apos;ll set up your business details.
          </p>
        )}
      </div>

      {/* Free Trial — primary CTA to access 100 minutes */}
      <div className="max-w-2xl mx-auto mb-12 p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
        <h2 className="text-2xl font-bold mb-2">100 free trial minutes</h2>
        <p className="text-muted-foreground mb-4">
          100 call minutes to try real AI answering. No time limit. No setup fee. No overage during trial.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Service pauses when minutes are used. Upgrade to any plan to continue.
        </p>
        {isLoggedIn ? (
          <Button size="lg" asChild>
            <Link href="/trial/start">Start your free trial</Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link href="/sign-up">Sign up to start free trial</Link>
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-4">Designed so you can test real calls—not demos.</p>
      </div>

      <PricingPlansWithAgreement plans={PLANS} isLoggedIn={isLoggedIn} />

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Why This Pricing Works</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Minute-based trial ensures fairness and real value delivery. No setup fees reduce friction.
          Industry-optimized Pro agents feel &quot;custom&quot; without custom labor. Clear upgrade ladder based on call volume and complexity.
        </p>
        <p className="text-muted-foreground">
          Consistent overage rate keeps pricing transparent.
        </p>
      </div>
    </div>
  )
}
