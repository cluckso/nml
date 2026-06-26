"use client"

import { MessageSquare } from "lucide-react"

interface SMSPreviewProps {
  className?: string
}

export function SMSPreview({ className = "" }: SMSPreviewProps) {
  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-4 border-foreground/20 bg-background p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/20 rounded-b-xl" />
        
        {/* Screen */}
        <div className="rounded-[2rem] bg-muted/30 pt-8 pb-4 px-3 min-h-[320px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">CallGrabbr</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>
          
          {/* SMS bubble */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm p-4 text-sm">
            <p className="font-bold text-primary mb-3">NEW LEAD CAPTURED</p>
            <div className="space-y-1.5 text-foreground/90">
              <p><span className="text-muted-foreground">Name:</span> John Martinez</p>
              <p><span className="text-muted-foreground">Phone:</span> (555) 234-5678</p>
              <p><span className="text-muted-foreground">Address:</span> 42 Maple St</p>
              <p><span className="text-muted-foreground">Job:</span> Plumbing leak - kitchen sink</p>
              <p><span className="text-muted-foreground">Urgency:</span> <span className="text-destructive font-medium">High</span></p>
            </div>
            <div className="mt-4 pt-3 border-t border-primary/20">
              <p className="text-primary font-medium text-center">Tap to call back →</p>
            </div>
          </div>
          
          {/* Timestamp */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Delivered 3 seconds after call ended
          </p>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/30 rounded-full" />
      </div>
    </div>
  )
}
