import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

// Note: lucide-react Check icon import

const PLANS = [
  {
    name: "Starter",
    price: 99,
    minutes: 500,
    setupFee: 99,
    description: "Perfect for solo operators & small shops",
    features: [
      "Up to 500 call minutes",
      "AI answers calls during business hours or after-hours",
      "Captures caller name, number, and reason",
      "Sends call summaries via text or email",
      "Missed-call recovery",
      "Custom greeting with your business name",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: 199,
    minutes: 1200,
    setupFee: 199,
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
    popular: true,
  },
  {
    name: "Local Plus",
    price: 299,
    minutes: 2500,
    setupFee: 299,
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
    popular: false,
  },
]

export default function PricingPage() {
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? "border-primary border-2" : ""}
          >
            <CardHeader>
              {plan.popular && (
                <div className="mb-2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                    Most Popular
                  </span>
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Setup: ${plan.setupFee}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block">
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Why This Pays for Itself</h2>
        <p className="text-lg text-muted-foreground mb-6">
          If you recover just one missed service call per month, the system covers its cost.
          Most customers recover 3–10 calls they were missing before.
        </p>
        <p className="text-muted-foreground">
          Don't talk tech. Talk results. This is revenue protection, not just call answering.
        </p>
      </div>
    </div>
  )
}
