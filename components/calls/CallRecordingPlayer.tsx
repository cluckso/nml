"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, X } from "lucide-react"
import { cn } from "@/lib/utils"

type CallRecordingPlayerProps = {
  url: string
  className?: string
  /** Compact control for list rows */
  compact?: boolean
}

export function CallRecordingPlayer({ url, className, compact = false }: CallRecordingPlayerProps) {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  if (compact) {
    return (
      <div className={cn("flex flex-col items-end gap-1", className)}>
        {!open ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            Play
          </Button>
        ) : (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <audio
              src={url}
              controls
              autoPlay
              className="h-8 max-w-[200px]"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            >
              Your browser does not support audio playback.
            </audio>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="Hide player"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setOpen((v) => !v)}
        >
          {open && playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          {open ? "Hide recording" : "Play recording"}
        </Button>
      </div>
      {open && (
        <audio
          src={url}
          controls
          autoPlay
          className="w-full max-w-md"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        >
          Your browser does not support audio playback.
        </audio>
      )}
    </div>
  )
}
