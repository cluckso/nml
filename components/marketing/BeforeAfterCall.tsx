import { PhoneOff, MessageSquare } from "lucide-react"

export function BeforeAfterCall() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-3">Before you pick up vs after we do</h2>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        Same missed ring. Different ending. This is the after-state you want on your phone.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-destructive mb-3">
            <PhoneOff className="h-5 w-5" aria-hidden />
            <p className="font-semibold">Before — voicemail</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>You&apos;re on a job. The phone rings. You can&apos;t pick up.</li>
            <li>They hang up. No voicemail.</li>
            <li>You see a missed call and a number you don&apos;t know.</li>
            <li>They already booked the next guy on the list.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
          <div className="flex items-center gap-2 text-primary mb-3">
            <MessageSquare className="h-5 w-5" aria-hidden />
            <p className="font-semibold">After — NEW LEAD CAPTURED</p>
          </div>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>Caller name and phone</li>
            <li>Address</li>
            <li>Job type and what&apos;s broken</li>
            <li>Urgency — tap to call back</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
