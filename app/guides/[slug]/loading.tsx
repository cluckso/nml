/** Instant fallback while a guide RSC payload loads — stops dead-click feel on /compare links. */
export default function GuideLoading() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-live="polite">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-10 w-3/4 max-w-xl rounded bg-muted animate-pulse" />
          <div className="h-4 w-48 rounded bg-muted/80 animate-pulse" />
          <div className="h-20 w-full rounded bg-muted/60 animate-pulse" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-40 rounded-md bg-muted animate-pulse" />
            <div className="h-11 w-36 rounded-md bg-muted/70 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="border-y border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="h-7 w-64 mx-auto mb-6 rounded bg-muted animate-pulse" />
          <div className="h-48 w-full rounded-lg border border-border/60 bg-background/50 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
