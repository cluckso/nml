import Image from "next/image"
import { cn } from "@/lib/utils"

type OverlayStrength = "light" | "medium" | "heavy" | "hero"

const overlayStyles: Record<OverlayStrength, string> = {
  light: "bg-gradient-to-b from-background/75 via-background/88 to-background/95",
  medium: "bg-gradient-to-b from-background/82 via-background/92 to-background/98",
  heavy: "bg-gradient-to-b from-background/88 via-background/94 to-background",
  hero: "bg-gradient-to-b from-background/55 via-background/82 to-background",
}

type SectionBackdropProps = {
  src: string
  alt?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  overlay?: OverlayStrength
  priority?: boolean
  as?: "section" | "div"
  /** Override Next/Image cover positioning (e.g. object-[center_30%]). */
  imageClassName?: string
}

export function SectionBackdrop({
  src,
  alt = "",
  children,
  className,
  contentClassName,
  overlay = "medium",
  priority = false,
  as: Tag = "section",
  imageClassName = "object-cover object-center",
}: SectionBackdropProps) {
  return (
    <Tag className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={imageClassName}
        priority={priority}
        sizes="100vw"
      />
      <div className={cn("absolute inset-0", overlayStyles[overlay])} aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(217_91%_60%_/_.14),transparent)]"
        aria-hidden
      />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </Tag>
  )
}
