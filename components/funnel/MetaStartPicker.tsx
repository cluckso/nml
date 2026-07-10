"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { META_FORM_INDUSTRY_OPTIONS } from "@/lib/meta-lead-routing"
import { getFunnelConfig } from "@/lib/funnel/industry-configs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function MetaStartPicker() {
  const searchParams = useSearchParams()
  const utmQuery = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
    .map((key) => {
      const value = searchParams.get(key)
      return value ? `${key}=${encodeURIComponent(value)}` : null
    })
    .filter(Boolean)
    .join("&")
  const utmSuffix = utmQuery ? `&${utmQuery}` : ""

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">What type of business do you run?</CardTitle>
          <CardDescription>
            Pick your industry to see a personalized missed-call ROI estimate and start your trial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {META_FORM_INDUSTRY_OPTIONS.map((option) => {
              const config = getFunnelConfig(option.slug)
              const icon = config?.icon ?? "📞"
              const href = `/start?industry=${encodeURIComponent(option.slug)}${utmSuffix}`

              return (
                <Link
                  key={option.label}
                  href={href}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span>
                    {icon} {option.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
