"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlowOption } from "@/lib/flow-types"
import { ListOrdered } from "lucide-react"

interface FlowPreviewProps {
  flow: FlowOption
  /** When true, show as locked/disabled (Basic plan) */
  locked?: boolean
}

export function FlowPreview({ flow, locked }: FlowPreviewProps) {
  return (
    <Card className={locked ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          {flow.label} — preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">{flow.description}</p>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          {flow.previewSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
