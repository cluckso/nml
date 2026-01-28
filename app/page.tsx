import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Landing page - no Check icon needed

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Never Miss Another Call — Even After Hours
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-powered answering & intake built specifically for local service businesses.
          Capture leads, book requests, and emergencies — without hiring staff.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What It Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Answers Every Call</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Never miss a lead, even when you're busy or closed. Works 24/7.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Captures Caller Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically collects name, phone, address, and issue details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Instantly flags urgent calls so you can prioritize what matters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sends Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant email and SMS notifications with all call details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Works 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Never calls in sick. Always available to answer your customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feels Like a Receptionist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional, friendly AI that represents your business well.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Who It's For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <h3 className="font-semibold mb-2">Plumbers & HVAC</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Auto Repair</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Childcare</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Electricians</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lawn & Snow</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Small Medical</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Wellness Offices</h3>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Service Businesses</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why This Pays for Itself</h2>
          <p className="text-lg text-muted-foreground mb-8">
            If you recover just one missed service call per month, the system covers its cost.
            Most customers recover 3–10 calls they were missing before.
          </p>
          <div className="bg-muted p-8 rounded-lg">
            <p className="text-2xl font-semibold mb-4">
              A human receptionist = $2,000–$3,500/month
            </p>
            <p className="text-2xl font-semibold text-primary">
              Your AI = $99–$299/month
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Capturing Every Call</h2>
          <p className="text-lg mb-8 opacity-90">
            Get set up in under 10 minutes. No technical knowledge required.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
