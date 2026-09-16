import Link from "next/link"
import { VS_PAGE_LINKS } from "@/lib/marketing/comparisons"

export function CompareUsLinks({
  heading = "Compare us",
  className = "",
}: {
  heading?: string
  className?: string
}) {
  return (
    <section className={className} aria-labelledby="compare-us-heading">
      <h2 id="compare-us-heading" className="text-2xl font-bold tracking-tight text-center mb-3">
        {heading}
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
        Side-by-side guides for shops already looking at a receptionist or another answering tool.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto list-none">
        {VS_PAGE_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
