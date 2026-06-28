"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GOOGLE_PLAY_STORE_URL, MOBILE_SCREENSHOTS } from "@/lib/mobile-app"

export function MobileAppDownload() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = MOBILE_SCREENSHOTS[activeIndex]

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? MOBILE_SCREENSHOTS.length - 1 : i - 1))
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === MOBILE_SCREENSHOTS.length - 1 ? 0 : i + 1))
  }, [])

  return (
    <section className="border-y border-border/50 bg-muted/20 py-16" aria-labelledby="mobile-app-heading">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Smartphone className="h-4 w-4" aria-hidden />
              Android app
            </div>
            <h2 id="mobile-app-heading" className="text-3xl font-bold mb-3">
              Manage leads on the go
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto lg:mx-0">
              Download the CallGrabbr Android app to view calls, get push alerts for emergencies, and
              check usage from your phone.
            </p>
            <Link
              href={GOOGLE_PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="lg" className="gap-2 min-h-[48px]">
                <Smartphone className="h-5 w-5" aria-hidden />
                Get it on Google Play
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-[220px] sm:w-[260px] aspect-[9/19.5] rounded-[2rem] border-4 border-border/80 bg-background shadow-2xl shadow-primary/10 overflow-hidden">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                className="object-cover object-top"
                sizes="260px"
                priority={activeIndex === 0}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goPrev}
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[7rem] text-center">{active.label}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goNext}
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2" role="tablist" aria-label="Screenshot thumbnails">
              {MOBILE_SCREENSHOTS.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={shot.label}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
