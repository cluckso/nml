import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Webhook, Key, ArrowRight } from "lucide-react"
import { MID_AND_HIGH_VOLUME_LABEL } from "@/lib/plan-labels"

export const metadata: Metadata = {
  title: "Zapier Integration - CallGrabbr",
  description: "Connect CallGrabbr to 6,000+ apps with Zapier. Automatically send new leads to your CRM, Slack, Google Sheets, and more.",
  alternates: { canonical: "/integrations/zapier" },
}

const STEPS = [
  {
    title: "Generate your API key",
    description: "Open Settings → Integrations in your CallGrabbr dashboard and click Connect Zapier to get your API key.",
  },
  {
    title: "Create a Zap",
    description: "In Zapier, search for CallGrabbr (or use Webhooks by Zapier with our REST Hook endpoints).",
  },
  {
    title: "Choose the New Lead trigger",
    description: "Every time CallGrabbr captures a lead from a call, Zapier receives caller name, phone, issue, and urgency flag.",
  },
  {
    title: "Send to your tools",
    description: "Route leads to HubSpot, Jobber, ServiceTitan, Slack, Google Sheets, email, or any of 6,000+ apps.",
  },
]

const TRIGGERS = [
  { name: "New Lead Captured", event: "new_lead", description: "Fires when a call ends with caller name, phone, or issue captured." },
]

export default function ZapierIntegrationPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://callgrabbr.com"

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Zap className="h-4 w-4" />
          Official Integration
        </div>
        <h1 className="text-4xl font-bold mb-4">Connect CallGrabbr to Zapier</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Automatically send every captured lead to your CRM, job management software, or team chat — no manual data entry.
        </p>
      </div>

      <div className="grid gap-6 mb-12">
        {STEPS.map((step, i) => (
          <Card key={step.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </span>
                {step.title}
              </CardTitle>
              <CardDescription className="ml-11">{step.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Available Triggers
          </CardTitle>
          <CardDescription>Events that can start a Zap</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {TRIGGERS.map((t) => (
              <li key={t.event} className="border rounded-lg p-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">event: {t.event}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Reference
          </CardTitle>
          <CardDescription>For Zapier platform developers and custom integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-mono">
          <div>
            <p className="text-muted-foreground font-sans text-xs mb-1">Authentication</p>
            <p>Authorization: Bearer {"<your_api_key>"}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-sans text-xs mb-1">Subscribe (REST Hook)</p>
            <p>POST {baseUrl}/api/integrations/zapier/hooks</p>
            <p className="text-muted-foreground font-sans mt-1">Body: {"{ \"target_url\": \"https://hooks.zapier.com/...\", \"event\": \"new_lead\" }"}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-sans text-xs mb-1">Unsubscribe</p>
            <p>DELETE {baseUrl}/api/integrations/zapier/hooks?id={"<hook_id>"}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-sans text-xs mb-1">Sample payload (new_lead)</p>
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`{
  "event": "new_lead",
  "business": { "id": "...", "name": "Acme HVAC" },
  "lead": {
    "callId": "...",
    "callerName": "John Smith",
    "callerPhone": "+15551234567",
    "issueDescription": "AC not cooling",
    "emergency": false,
    "createdAt": "2026-06-25T12:00:00.000Z"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/settings">
            Connect in Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="https://zapier.com/apps" target="_blank" rel="noopener noreferrer">
            Browse Zapier Apps
          </a>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Available on {MID_AND_HIGH_VOLUME_LABEL} plans. Also works with the Zapier webhook URL in Settings → CRM.
      </p>
    </div>
  )
}
