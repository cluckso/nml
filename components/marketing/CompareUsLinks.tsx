"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useLinkStatus } from "next/link"
import { useRouter } from "next/navigation"
import { VS_PAGE_LINKS } from "@/lib/marketing/comparisons"
import { cn } from "@/lib/utils"

function CompareLinkPendingHint() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      data-pending={pending ? "" : undefined}
      className={cn(
        "ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary",
        "opacity-0 transition-opacity duration-150",
        "delay-100",
        pending && "opacity-100 animate-pulse delay-0"
      )}
    />
  )
}

function CompareLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm font-medium",
        "hover:border-primary/40 hover:text-primary",
        "transition-[border-color,color,opacity] duration-150",
        "[&:has([data-pending])]:pointer-events-none [&:has([data-pending])]:opacity-70 [&:has([data-pending])]:text-primary"
      )}
    >
      <span className="min-w-0 flex-1">{title}</span>
      <CompareLinkPendingHint />
    </Link>
  )
}

export function CompareUsLinks({
  heading = "Compare us",
  className = "",
}: {
  heading?: string
  className?: string
}) {
  const router = useRouter()

  // Eager prefetch so Ruby/Rosie (and siblings) are warm before the section is clicked.
  useEffect(() => {
    for (const item of VS_PAGE_LINKS) {
      void router.prefetch(item.href)
    }
  }, [router])

  return (
    <section className={className} aria-labelledby="compare-us-heading">
      <h2 id="compare-us-heading" className="text-2xl font-bold tracking-tight text-center mb-3">
        {heading}
      </h2>
      <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto">
        Side-by-side guides for shops already looking at a receptionist or another answering tool.
      </p>
      <p className="text-center mb-8">
        <Link
          href="/compare"
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Full comparison hub
        </Link>
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto list-none">
        {VS_PAGE_LINKS.map((item) => (
          <li key={item.href}>
            <CompareLink href={item.href} title={item.title} />
          </li>
        ))}
      </ul>
    </section>
  )
}
