/**
 * Third-party review listings.
 * Only show platforms that are actually live — never "not live yet" placeholders.
 */
const LIVE_LISTINGS: { href: string; label: string }[] = [
  // Add G2 / Capterra / Trustpilot here when the listing URL is public.
]

export function ReviewSignals() {
  if (LIVE_LISTINGS.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-10">
      <p className="text-center text-sm text-muted-foreground mb-4">Third-party listings</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {LIVE_LISTINGS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:border-primary/40"
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  )
}
