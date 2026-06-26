"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TranscriptCollapsibleProps {
  transcript: string
}

export function TranscriptCollapsible({ transcript }: TranscriptCollapsibleProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground gap-2 -ml-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide full transcript
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View full transcript
          </>
        )}
      </Button>
      {expanded && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
            {transcript}
          </p>
        </div>
      )}
    </div>
  )
}
