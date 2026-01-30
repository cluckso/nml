import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { Button } from "@/components/ui/button"

const PLANS = [
  {
    name: "Basic",
    description: "Best for solo operators & small shops",
    features: [
      "300 minutes / month",
      "$0.20/min overage",
      "Self-serve only",
      "24/7 AI call answering",
      "Caller name, phone, and reason captured",
      "Call summaries by email",
    ],
  },
  {
    name: "Pro",
    description: "Best for growing service businesses",
    features: [
      "900 minutes / month",
      "Industry-optimized AI agents",
      "Appointment + emergency logic",
      "$0.20/min overage",
      "Service-specific intake flows",
      "Email and CRM forwarding",
    ],
  },
  {
    name: "Local Plus",
    description: "Built for high-volume, multi-department trades",
    features: [
      "1,800 minutes / month",
      "Multi-department routing",
      "Branded voice + reporting",
      "$0.20/min overage",
      "After-hours emergency handling",
      "Weekly usage & lead reports",
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
          Overage on all plans: $0.20/min after included minutes.
        </p>
        {isLoggedIn && (
          <p className="mt-2 text-sm text-primary font-medium">
            Choose a plan below — then you&apos;ll set up your business details.
          </p>
        )}
      </div>

      {/* Free Trial — primary CTA: 50 minutes, 14 days, card required */}
      <div className="max-w-2xl mx-auto mb-12 p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
        <h2 className="text-2xl font-bold mb-2">Free trial: 50 minutes, 14 days</h2>
        <p className="text-muted-foreground mb-4">
          50 call minutes to try real AI answering. Card required to start — we won&apos;t charge until you upgrade. One trial per business number.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          No overage during trial. Service pauses when minutes are used or when the trial ends. Upgrade to any plan to continue.
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
