import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const JOBS = [
  {
    title: "Your livelihood stops walking out the door",
    body: "Every missed call can feed your competitor instead of your family. When the phone gets answered, that job stays on your board.",
  },
  {
    title: "You become the contractor who actually picks up — the one homeowners recommend",
    body: "People remember the shop that answered. That is how you get the next referral, not from a voicemail they never left.",
  },
  {
    title: "You run a professional operation, even solo",
    body: "Callers get a clear conversation and you get a texted lead. You look like a crew with a front desk — without hiring one.",
  },
] as const

export function JtbdOutcomes() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-3">What changes when every call gets answered</h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Not a feature list. What it feels like when missed calls stop costing you jobs.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {JOBS.map((job) => (
          <Card key={job.title} className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg leading-snug">{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
