"use client"

import { useMemo, useState } from "react"
import type { FunnelConfig, FunnelStepField } from "@/lib/funnel/funnel-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { FunnelProgressBar } from "./FunnelProgressBar"
import { trackFunnelStepComplete } from "@/lib/funnel/analytics"

interface FunnelStepFormProps {
  config: FunnelConfig
  values: Record<string, string>
  onChange: (fieldId: string, value: string) => void
  onComplete: () => void | Promise<void>
  submitting?: boolean
}

function validateField(field: FunnelStepField, value: string): string | null {
  const trimmed = value.trim()
  if (field.required && !trimmed) return `${field.label} is required`

  if (field.type === "email" && trimmed) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address"
  }

  if (field.type === "phone" && trimmed) {
    const digits = trimmed.replace(/\D/g, "")
    if (digits.length < 10) return "Enter a valid phone number"
  }

  return null
}

function validateStep(fields: FunnelStepField[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const err = validateField(field, values[field.id] ?? "")
    if (err) errors[field.id] = err
  }
  return errors
}

export function FunnelStepForm({
  config,
  values,
  onChange,
  onComplete,
  submitting = false,
}: FunnelStepFormProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const step = config.steps[stepIndex]
  const isLast = stepIndex === config.steps.length - 1

  const callsPerWeek = useMemo(() => {
    const vol = values.callVolume
    if (vol === "under-20") return 15
    if (vol === "20-50") return 35
    if (vol === "50-100") return 75
    if (vol === "100-plus") return 120
    return 35
  }, [values.callVolume])

  const handleNext = async () => {
    const stepErrors = validateStep(step.fields, values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    trackFunnelStepComplete(config.slug, step.id, stepIndex)

    if (isLast) {
      await onComplete()
      return
    }
    setStepIndex((i) => i + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStepIndex((i) => Math.max(0, i - 1))
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur max-w-xl mx-auto">
      <CardHeader>
        <FunnelProgressBar config={config} currentStep={stepIndex} className="mb-4" />
        <CardTitle>{step.title}</CardTitle>
        {step.subtitle && <CardDescription>{step.subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">
        {step.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>

            {field.type === "select" && field.options && (
              <select
                id={field.id}
                value={values[field.id] ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "radio" && field.options && (
              <div className="space-y-2">
                {field.options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      values[field.id] === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={values[field.id] === opt.value}
                      onChange={() => onChange(field.id, opt.value)}
                      className="mt-1"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {(field.type === "text" || field.type === "email" || field.type === "phone") && (
              <Input
                id={field.id}
                type={field.type === "phone" ? "tel" : field.type}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                autoComplete={
                  field.type === "email" ? "email" : field.type === "phone" ? "tel" : "organization"
                }
              />
            )}

            {errors[field.id] && (
              <p className="text-sm text-destructive" role="alert">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}

        <input type="hidden" name="callsPerWeekEstimate" value={callsPerWeek} readOnly />

        <div className="flex gap-3 pt-2">
          {stepIndex > 0 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={submitting}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={handleNext} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : isLast ? (
              "See my ROI & start trial"
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function getCallsPerWeekFromVolume(callVolume: string | undefined): number {
  if (callVolume === "under-20") return 15
  if (callVolume === "20-50") return 35
  if (callVolume === "50-100") return 75
  if (callVolume === "100-plus") return 120
  return 35
}
