import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { PricingPlansWithAgreement } from "@/components/pricing/PricingPlansWithAgreement"
import { AudioExamples } from "@/components/marketing/AudioExamples"
import { Button } from "@/components/ui/button"

const PLANS = [
  {
    name: "Starter",
    description: "Missed call capture and alerts",
    features: [
      "Missed call capture",
      "SMS summary",
      "Lead email notification",
    ],
  },
  {
    name: "Pro",
    description: "24/7 answering and booking",
    features: [
      "24/7 answering",
      "Appointment booking",
      "SMS follow-up",
      "Basic CRM export",
    ],
  },
  {
    name: "Elite",
    description: "Custom scripts and reporting",
    features: [
      "Custom scripts",
      "Multi-location",
      "Reporting dashboard",
    ],
  },
]

export default async function PricingPage() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tiered pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free — no card required. Upgrade when you&apos;re ready.
        </p>
        <p className="mt-2 text-muted-foreground">
          No setup fees. No contracts. Cancel anytime.
        </p>
        {isLoggedIn && (
          <p className="mt-2 text-sm text-primary font-medium">
            Start a free trial or pick a plan below.
          </p>
        )}
      </div>

      {/* Free trial — no card required */}
      <div className="max-w-2xl mx-auto mb-12 p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
        <h2 className="text-2xl font-bold mb-2">Free trial — no card required</h2>
        <p className="text-muted-foreground mb-4">
          50 call minutes or 4 days, whichever comes first. We won&apos;t charge until you choose a plan. One trial per business number.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Set up your business and try the AI. Upgrade to Starter, Pro, or Elite when you&apos;re ready.
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

    </div>
  )
}
