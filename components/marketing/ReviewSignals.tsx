import { GOOGLE_PLAY_STORE_URL } from "@/lib/mobile-app"

export function ReviewSignals() {
  return (
    <section className="container mx-auto px-4 py-10">
      <p className="text-center text-sm text-muted-foreground mb-4">Third-party listings</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={GOOGLE_PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:border-primary/40"
        >
          Android app on Google Play
        </a>
        <span className="rounded-lg border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground">
          G2 — listing not live yet
        </span>
        <span className="rounded-lg border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground">
          Capterra — listing not live yet
        </span>
        <span className="rounded-lg border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground">
          Trustpilot — listing not live yet
        </span>
      </div>
    </section>
  )
}
