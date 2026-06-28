import type { FunnelTestimonial as FunnelTestimonialData } from "@/lib/funnel/funnel-config"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

interface FunnelTestimonialProps {
  testimonial: FunnelTestimonialData
  className?: string
}

export function FunnelTestimonial({ testimonial, className = "" }: FunnelTestimonialProps) {
  return (
    <section className={`container mx-auto px-4 py-8 ${className}`}>
      <Card className="max-w-2xl mx-auto border-border/50 bg-card/40 backdrop-blur">
        <CardContent className="pt-6">
          <Quote className="h-8 w-8 text-primary/40 mb-3" aria-hidden />
          <blockquote className="text-lg text-foreground/90 mb-4">&ldquo;{testimonial.quote}&rdquo;</blockquote>
          <footer className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{testimonial.author}</span>
            {testimonial.role && <> · {testimonial.role}</>}
          </footer>
        </CardContent>
      </Card>
    </section>
  )
}
