"use client"

import type { FunnelConfig } from "@/lib/funnel/funnel-config"

interface FunnelProgressBarProps {
  config: FunnelConfig
  currentStep: number
  className?: string
}

export function FunnelProgressBar({ config, currentStep, className = "" }: FunnelProgressBarProps) {
  const total = config.steps.length

  return (
    <div className={`w-full ${className}`} aria-label={`Step ${currentStep + 1} of ${total}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>
          Step {currentStep + 1} of {total}
        </span>
        <span>{Math.round(((currentStep + 1) / total) * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / total) * 100}%` }}
        />
      </div>
      <div className="mt-3 hidden sm:flex gap-2">
        {config.steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex-1 text-center text-xs truncate ${
              i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {step.title.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  )
}
