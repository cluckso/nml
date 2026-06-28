import type { FunnelConfig } from "@/lib/funnel/funnel-config"
import { SMSPreview } from "@/components/marketing/SMSPreview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Phone } from "lucide-react"

interface FunnelDemoSectionProps {
  config: FunnelConfig
  className?: string
}

export function FunnelDemoSection({ config, className = "" }: FunnelDemoSectionProps) {
  return (
    <section className={`container mx-auto px-4 py-12 ${className}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          See what happens after a {config.displayName.toLowerCase()} call
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          CallGrabbr captures caller details and sends you a text summary in seconds.
        </p>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {config.exampleTranscript ? (
            <Card className="border-border/50 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Sample call transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {config.exampleTranscript}
                </pre>
                {config.callSummary && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-medium text-primary mb-1">Lead summary</p>
                    <p className="text-sm">{config.callSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div />
          )}

          <div>
            <div className="flex items-center gap-2 justify-center mb-4 text-sm font-medium text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              What you receive
            </div>
            <SMSPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
