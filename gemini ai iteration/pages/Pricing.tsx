import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Check, Info } from "lucide-react";
import { isLoggedIn } from "../lib/utils";

const PLANS = [
  {
    name: "Basic",
    price: 99,
    description: "Best for solo operators & small shops",
    features: [
      "Up to 500 call minutes / month",
      "24/7 AI call answering",
      "Caller name & reason captured",
      "Call summaries via SMS/email",
      "Missed-call recovery",
      "Custom greeting",
    ],
  },
  {
    name: "Pro",
    price: 199,
    popular: true,
    description: "Best for growing service businesses",
    features: [
      "Up to 1,200 call minutes / month",
      "Industry-optimized AI agents",
      "Appointment request capture",
      "Emergency detection & routing",
      "SMS confirmation to callers",
      "Full transcripts + summaries",
      "CRM forwarding",
    ],
  },
  {
    name: "Local Plus",
    price: 299,
    description: "High-volume, multi-department",
    features: [
      "Up to 2,500 call minutes / month",
      "Priority call routing",
      "Multi-department logic",
      "After-hours escalation logic",
      "Lead tagging & reports",
      "Weekly usage reports",
      "Fully branded AI voice",
    ],
  },
];

export default function PricingPage() {
  const authed = isLoggedIn();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            No setup fees. No contracts. Cancel anytime. <br/>
            All plans start with a <span className="text-blue-400 font-semibold">free trial</span>.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20">
        <div className="max-w-md mx-auto mb-12 bg-white/10 backdrop-blur border border-white/20 text-white p-4 rounded-xl text-center shadow-lg">
          <p className="font-semibold flex items-center justify-center gap-2">
            <Info className="h-4 w-4" /> 
            Free Trial Included
          </p>
          <p className="text-sm opacity-90 mt-1">100 free call minutes · No time limit · No setup fee</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col relative ${
                plan.popular 
                  ? "border-blue-500 shadow-2xl scale-105 z-10" 
                  : "border-slate-200 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={authed ? "/onboarding" : "/sign-up"} className="w-full">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {authed ? "Switch Plan" : "Start Free Trial"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Why users love our pricing</h3>
          <p className="text-muted-foreground leading-relaxed">
            We use a minute-based model because it ensures fairness. You only pay for the value you receive.
            Overage on all plans is just $0.10/min. Industry-optimized agents come included in Pro plans, 
            saving you thousands in custom development costs.
          </p>
        </div>
      </div>
    </div>
  );
}