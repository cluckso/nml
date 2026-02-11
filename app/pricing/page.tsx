import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { AudioExamples } from "@/components/marketing/AudioExamples"
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
      "Industry-optimized intake flows",
      "Appointment + emergency logic",
      "Email, CRM & SMS to callers",
      "$0.20/min overage",
      "Lead tagging (estimate, follow-up)",
    ],
  },
  {
    name: "Local Plus",
    description: "Built for high-volume local trades",
    features: [
      "1,800 minutes / month",
      "Branded AI voice + voice controls",
      "Weekly usage & lead report emails",
      "$0.20/min overage",
      "After-hours emergency handling",
      "Priority support",
    ],
  },
]

export default async function PricingPage() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">CallGrabbr — Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Simple, usage-based pricing built for service businesses.
        </p>
        <p className="mt-2 text-muted-foreground">
          No setup fees on plans. Contact us for CRM setup pricing. No contracts. Cancel anytime.
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

      {/* Free Trial — primary CTA: 50 minutes or 4 days, whichever first */}
      <div className="max-w-2xl mx-auto mb-12 p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
        <h2 className="text-2xl font-bold mb-2">Free trial: 50 minutes or 4 days</h2>
        <p className="text-muted-foreground mb-4">
          Trial ends when you use 50 call minutes or 4 days pass, whichever comes first. Card required to start — we won&apos;t charge until you upgrade. One trial per business number.
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
      </div>

      <AudioExamples />

      <PricingPlansWithAgreement plans={PLANS} isLoggedIn={isLoggedIn} />

      <div className="max-w-2xl mx-auto mb-12 p-6 rounded-xl border bg-muted/30">
        <h2 className="text-xl font-semibold mb-2">Add-ons</h2>
        <div className="text-left">
          <p className="font-medium text-muted-foreground">Contact us for CRM setup pricing.</p>
        </div>
      </div>

    </div>
  )
}
