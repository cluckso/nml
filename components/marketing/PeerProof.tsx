import { Quote } from "lucide-react"

const PEERS = [
  {
    quote:
      "We captured 12 after-hours leads in the first month. One emergency install paid for a year of CallGrabbr.",
    author: "Mike R.",
    role: "HVAC owner, Texas",
  },
  {
    quote:
      "Our after-hours capture rate went from near zero to most calls answered. Game changer for emergency work.",
    author: "Sarah T.",
    role: "Plumbing contractor",
  },
  {
    quote:
      "After the last storm we booked 8 inspections from calls we would have missed on the roof.",
    author: "Dan K.",
    role: "Roofing contractor",
  },
] as const

/** Named peer stories for homepage trust — outcomes over percentages. */
export function PeerProof() {
  return (
    <section className="container mx-auto px-4 py-14">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
        Shops that stopped leaving money on the table
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Same story in different trades: you&apos;re busy, the phone rings, and the job
        used to walk. Now it texts you instead.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PEERS.map((peer) => (
          <figure
            key={peer.author}
            className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 text-left"
          >
            <Quote className="h-7 w-7 text-primary/40 mb-3" aria-hidden />
            <blockquote className="text-foreground/90 mb-4 leading-relaxed">
              &ldquo;{peer.quote}&rdquo;
            </blockquote>
            <figcaption className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{peer.author}</span>
              {" · "}
              {peer.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
