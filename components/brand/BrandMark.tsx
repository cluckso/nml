import Link from "next/link"
import Image from "next/image"

/** Logo + wordmark for auth and other unbranded surfaces. */
export function BrandMark({
  href = "/",
  size = "md",
  className = "",
}: {
  href?: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const iconPx = size === "sm" ? 32 : size === "lg" ? 44 : 36
  const textClass =
    size === "sm"
      ? "text-lg"
      : size === "lg"
        ? "text-2xl"
        : "text-xl"

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity ${className}`}
      aria-label="CallGrabbr home"
    >
      <Image
        src="/icon.png"
        alt=""
        width={iconPx}
        height={iconPx}
        className="rounded-lg shrink-0"
        priority
      />
      <span className={`font-bold tracking-tight ${textClass}`}>CallGrabbr</span>
    </Link>
  )
}
