import Link from "next/link"
import Image from "next/image"

/** Logo + wordmark for auth, nav, and marketing. */
export function BrandMark({
  href = "/",
  size = "md",
  className = "",
}: {
  href?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const iconPx = size === "sm" ? 32 : size === "lg" ? 48 : size === "xl" ? 64 : 36
  const textClass =
    size === "sm"
      ? "text-lg"
      : size === "lg"
        ? "text-3xl"
        : size === "xl"
          ? "text-4xl sm:text-5xl"
          : "text-xl"
  const gapClass = size === "xl" || size === "lg" ? "gap-3.5" : "gap-2.5"

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${gapClass} text-foreground hover:opacity-90 transition-opacity ${className}`}
      aria-label="CallGrabbr home"
    >
      <Image
        src="/icon.png"
        alt=""
        width={iconPx}
        height={iconPx}
        className={`rounded-xl shrink-0 ${size === "xl" ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" : ""}`}
        priority
      />
      <span className={`font-bold tracking-tight ${textClass}`}>CallGrabbr</span>
    </Link>
  )
}
