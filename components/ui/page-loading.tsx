import Image from "next/image"

export function PageLoading() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex size-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary motion-safe:animate-[spin_2.4s_linear_infinite] motion-reduce:animate-none" />
        <div className="absolute inset-2 rounded-full bg-primary/5 motion-safe:animate-pulse" />
        <div className="relative flex size-20 items-center justify-center rounded-full border border-border/70 bg-card shadow-lg shadow-primary/10">
          <Image
            src="/icon.webp"
            alt=""
            width={56}
            height={56}
            priority
            className="size-14 object-contain"
          />
        </div>
      </div>
    </div>
  )
}
