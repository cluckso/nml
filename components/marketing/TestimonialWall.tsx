import { TESTIMONIAL_REQUEST_EMAIL, CUSTOMER_STORIES } from "@/lib/marketing/social-proof"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialWall() {
  if (CUSTOMER_STORIES.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16" aria-labelledby="customer-stories-heading">
        <h2 id="customer-stories-heading" className="text-3xl font-bold text-center mb-3">
          Stories from shops
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
          We do not publish made-up reviews. This wall is ready for named quotes with first name,
          trade or town, photo, and what job got captured — once real customers send them.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Use CallGrabbr and want to be named? Email{" "}
          <a href={`mailto:${TESTIMONIAL_REQUEST_EMAIL}`} className="text-primary hover:underline">
            {TESTIMONIAL_REQUEST_EMAIL}
          </a>
          .
        </p>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="customer-stories-heading">
      <h2 id="customer-stories-heading" className="text-3xl font-bold text-center mb-10">
        Stories from shops
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {CUSTOMER_STORIES.map((story) => (
          <Card key={story.name + story.role} className="glass-card">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm leading-relaxed">&ldquo;{story.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                {story.photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.photoSrc}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {story.initials}
                  </span>
                )}
                <div>
                  <p className="font-medium text-sm">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
