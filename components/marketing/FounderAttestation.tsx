import Image from "next/image"
import { FOUNDER } from "@/lib/marketing/founder"

/** Signature + printed name/title under the founding story. */
export function FounderAttestation() {
  return (
    <figure className="mt-10 pt-8 border-t border-border/60">
      <Image
        src={FOUNDER.signatureSrc}
        alt={`Signature of ${FOUNDER.name}`}
        width={400}
        height={139}
        className="h-14 w-auto max-w-[min(100%,280px)] object-contain object-left dark:invert"
      />
      <figcaption className="mt-3 space-y-0.5">
        <p className="text-base font-semibold text-foreground tracking-tight">{FOUNDER.name}</p>
        <p className="text-sm text-muted-foreground">{FOUNDER.title}</p>
      </figcaption>
    </figure>
  )
}
