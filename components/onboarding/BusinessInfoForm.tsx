"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

interface BusinessInfo {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  serviceAreas: string[]
  phoneNumber?: string
  ownerPhone?: string
  businessHours?: { open: string; close: string; days: string[] }
  departments?: string[]
  crmWebhookUrl?: string
  forwardToEmail?: string
  afterHoursEmergencyPhone?: string
}

interface BusinessInfoFormProps {
  initialData?: Partial<BusinessInfo>
  onSubmit: (data: BusinessInfo) => void
  onBack?: () => void
  /** Plan type from subscription — only show Pro/Local Plus fields when relevant */
  planType?: "STARTER" | "PRO" | "LOCAL_PLUS" | null
}

export function BusinessInfoForm({
  initialData,
  onSubmit,
  onBack,
  planType = null,
}: BusinessInfoFormProps) {
  const showProFeatures = planType === "PRO" || planType === "LOCAL_PLUS"
  const showLocalPlusFeatures = planType === "LOCAL_PLUS"
  const [formData, setFormData] = useState<BusinessInfo>({
    name: initialData?.name || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    serviceAreas:
      initialData?.serviceAreas?.length ? initialData.serviceAreas : initialData?.city ? [initialData.city] : [],
    phoneNumber: initialData?.phoneNumber || "",
    businessHours: initialData?.businessHours || { open: "09:00", close: "17:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    departments: initialData?.departments || [],
    crmWebhookUrl: initialData?.crmWebhookUrl || "",
    forwardToEmail: initialData?.forwardToEmail || "",
    afterHoursEmergencyPhone: initialData?.afterHoursEmergencyPhone || "",
  })
  const [serviceAreaInput, setServiceAreaInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.serviceAreas.length) {
      return
    }
    onSubmit(formData)
  }

  const addServiceArea = () => {
    const value = serviceAreaInput.trim()
    if (!value) return
    const toAdd = [...new Set(value.split(",").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean))]
    const existingLower = new Set(formData.serviceAreas.map((a) => a.toLowerCase()))
    const newAreas = toAdd.filter((a) => !existingLower.has(a.toLowerCase()))
    if (newAreas.length === 0) {
      setServiceAreaInput("")
      return
    }
    setFormData({ ...formData, serviceAreas: [...formData.serviceAreas, ...newAreas] })
    setServiceAreaInput("")
  }

  const removeServiceArea = (index: number) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Business Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Plumbers R' Us"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          placeholder="123 Main St"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            placeholder="Platteville"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
            placeholder="WI"
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          required
          placeholder="53818"
          maxLength={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Business phone number *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber || ""}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
          placeholder="(608) 555-1234"
        />
        <p className="text-xs text-muted-foreground">
          The line you forward to your AI number. One trial per business number.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Service areas (cities/towns you serve) *</Label>
        <p className="text-xs text-muted-foreground">
          Add each city or town where you provide service. The AI will only accept calls for these areas.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.serviceAreas.map((area, index) => (
            <span
              key={`${area}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {area}
              <button
                type="button"
                onClick={() => removeServiceArea(index)}
                className="rounded-full p-0.5 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Remove ${area}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={serviceAreaInput}
            onChange={(e) => setServiceAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addServiceArea())}
            placeholder="e.g. Platteville, Madison"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addServiceArea} disabled={!serviceAreaInput.trim()}>
            Add
          </Button>
        </div>
        {formData.serviceAreas.length === 0 && (
          <p className="text-sm text-destructive">Add at least one city or town you serve.</p>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Business hours</h3>
        <p className="text-sm text-muted-foreground">When you're open. Outside these hours, callers hear we're closed and can leave info.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Open</Label>
            <Input
              type="time"
              value={formData.businessHours?.open || "09:00"}
              onChange={(e) => setFormData({
                ...formData,
                businessHours: { ...formData.businessHours!, open: e.target.value, close: formData.businessHours?.close || "17:00", days: formData.businessHours?.days || [] },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Close</Label>
            <Input
              type="time"
              value={formData.businessHours?.close || "17:00"}
              onChange={(e) => setFormData({
                ...formData,
                businessHours: { ...formData.businessHours!, open: formData.businessHours?.open || "09:00", close: e.target.value, days: formData.businessHours?.days || [] },
              })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <label key={day} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.businessHours?.days?.includes(day) ?? false}
                onChange={(e) => {
                  const days = formData.businessHours?.days || []
                  const next = e.target.checked ? [...days, day] : days.filter((d) => d !== day)
                  setFormData({ ...formData, businessHours: { ...formData.businessHours!, open: formData.businessHours?.open || "09:00", close: formData.businessHours?.close || "17:00", days: next } })
                }}
              />
              <span className="capitalize">{day.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>

      {showProFeatures && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-medium">Included in your plan</h3>
          {showLocalPlusFeatures && (
            <div className="space-y-2">
              <Label htmlFor="departments">Departments (comma-separated)</Label>
              <Input
                id="departments"
                value={(formData.departments || []).join(", ")}
                onChange={(e) => setFormData({ ...formData, departments: e.target.value ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean) : [] })}
                placeholder="Plumbing, HVAC"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="crmWebhookUrl">CRM webhook URL (optional)</Label>
            <Input
              id="crmWebhookUrl"
              type="url"
              value={formData.crmWebhookUrl || ""}
              onChange={(e) => setFormData({ ...formData, crmWebhookUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="forwardToEmail">Forward leads to email (optional)</Label>
            <Input
              id="forwardToEmail"
              type="email"
              value={formData.forwardToEmail || ""}
              onChange={(e) => setFormData({ ...formData, forwardToEmail: e.target.value })}
              placeholder="crm@company.com"
            />
          </div>
          {showLocalPlusFeatures && (
            <div className="space-y-2">
              <Label htmlFor="afterHoursEmergencyPhone">After-hours emergency phone</Label>
              <Input
                id="afterHoursEmergencyPhone"
                type="tel"
                value={formData.afterHoursEmergencyPhone || ""}
                onChange={(e) => setFormData({ ...formData, afterHoursEmergencyPhone: e.target.value })}
                placeholder="+16085551234"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
