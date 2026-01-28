"use client"

import { Industry } from "@prisma/client"
import { INDUSTRIES } from "@/lib/industries"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IndustrySelectorProps {
  selected?: Industry
  onSelect: (industry: Industry) => void
}

export function IndustrySelector({ selected, onSelect }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {INDUSTRIES.map((industry) => (
        <Button
          key={industry.value}
          variant={selected === industry.value ? "default" : "outline"}
          className={cn(
            "h-auto p-6 flex flex-col items-start text-left",
            selected === industry.value && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(industry.value)}
        >
          <span className="font-semibold text-lg">{industry.label}</span>
          <span className="text-sm text-muted-foreground mt-1">
            {industry.description}
          </span>
        </Button>
      ))}
    </div>
  )
}
