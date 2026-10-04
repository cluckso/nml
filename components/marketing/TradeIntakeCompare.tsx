import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIndustryLandingBySlug } from "@/lib/industry-data"

const GENERIC_QUESTIONS = [
  "How can I help you?",
  "What's the best number to reach you?",
  "Anything else we should know?",
]

export function TradeIntakeCompare() {
  const hvac = getIndustryLandingBySlug("hvac")
  const plumbing = getIndustryLandingBySlug("plumbing")

  const columns = [
    {
      title: "HVAC intake",
      subtitle: "Trade-tuned questions",
      questions: hvac?.exampleQuestions ?? [],
      highlight: true,
    },
    {
      title: "Plumbing intake",
      subtitle: "Trade-tuned questions",
      questions: plumbing?.exampleQuestions ?? [],
      highlight: true,
    },
    {
      title: "Generic answering",
      subtitle: "What most tools ask",
      questions: GENERIC_QUESTIONS,
      highlight: false,
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="trade-intake-heading">
      <h2 id="trade-intake-heading" className="text-3xl font-bold text-center mb-3">
        Trade questions, not &quot;How can I help you?&quot;
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        CallGrabbr runs intake scripts tuned to your trade — so HVAC callers get asked about
        heat and cool, and plumbing callers get asked about leaks, not a generic greeting.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {columns.map((col) => (
          <Card
            key={col.title}
            className={
              col.highlight
                ? "border-primary/40 bg-primary/5"
                : "border-border/60 bg-muted/20 opacity-90"
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg tracking-tight">{col.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{col.subtitle}</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
                {col.questions.map((q) => (
                  <li key={q} className="leading-snug">
                    {q}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
