"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

interface BusinessInfo {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phoneNumber?: string
  ownerPhone?: string
  consentSmsNotifications?: boolean
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
    phoneNumber: initialData?.phoneNumber || "",
    ownerPhone: initialData?.ownerPhone || "",
    consentSmsNotifications: initialData?.consentSmsNotifications ?? !!initialData?.ownerPhone,
    businessHours: initialData?.businessHours || { open: "09:00", close: "17:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    departments: initialData?.departments || [],
    crmWebhookUrl: initialData?.crmWebhookUrl || "",
    forwardToEmail: initialData?.forwardToEmail || "",
    afterHoursEmergencyPhone: initialData?.afterHoursEmergencyPhone || "",
  })
  const [smsConsentError, setSmsConsentError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.ownerPhone?.trim() && !formData.consentSmsNotifications) {
      setSmsConsentError(true)
      return
    }
    setSmsConsentError(false)
    onSubmit({
      ...formData,
      ownerPhone: formData.consentSmsNotifications ? formData.ownerPhone : undefined,
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
        <Label htmlFor="phoneNumber">Business phone (for call forwarding)</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber || ""}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+16085551234"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerPhone">Your phone (for SMS call alerts)</Label>
        <Input
          id="ownerPhone"
          type="tel"
          value={formData.ownerPhone || ""}
          onChange={(e) => {
            setFormData({ ...formData, ownerPhone: e.target.value })
            setSmsConsentError(false)
          }}
          placeholder="+16085551234"
        />
        <label className="flex items-start gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted/30">
          <input
            type="checkbox"
            checked={formData.consentSmsNotifications ?? false}
            onChange={(e) => {
              setFormData({ ...formData, consentSmsNotifications: e.target.checked })
              setSmsConsentError(false)
            }}
            className="mt-0.5 h-4 w-4 rounded border-input"
          />
          <span className="text-muted-foreground">
            I consent to receive account and call notifications via text message at the number I provide. Message and data rates may apply. I can opt out at any time.
          </span>
        </label>
        {smsConsentError && (
          <p className="text-sm text-destructive">
            Please consent to receive SMS notifications to save your phone number for call alerts.
          </p>
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
