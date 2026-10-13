"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { SmsConsentCheckbox } from "@/components/consent/SmsConsentCheckbox"
import { PhoneInputWithCountry } from "@/components/ui/phone-input-with-country"

/** Default hours applied silently so the agent has availability without a form. */
export const DEFAULT_ONBOARDING_HOURS = {
  open: "09:00",
  close: "17:00",
  days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
} as const

interface BusinessInfo {
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  serviceAreas: string[]
  phoneNumber?: string
  ownerPhone?: string
  smsConsent?: boolean
  businessHours?: { open: string; close: string; days: string[] }
}

interface BusinessInfoFormProps {
  initialData?: Partial<BusinessInfo>
  onSubmit: (data: BusinessInfo) => void
  /** Disable submit (e.g. while saving) to prevent double-submit */
  disabled?: boolean
}

export function BusinessInfoForm({
  initialData,
  onSubmit,
  disabled = false,
}: BusinessInfoFormProps) {
  const hadTrialPhone = !!(initialData?.phoneNumber?.trim())
  const [formData, setFormData] = useState<BusinessInfo>({
    name: initialData?.name || "",
    serviceAreas:
      initialData?.serviceAreas?.length
        ? initialData.serviceAreas
        : initialData?.city
          ? [initialData.city]
          : [],
    phoneNumber: initialData?.phoneNumber || "",
    ownerPhone: initialData?.ownerPhone || "",
    smsConsent: initialData?.smsConsent ?? false,
    businessHours: initialData?.businessHours || { ...DEFAULT_ONBOARDING_HOURS, days: [...DEFAULT_ONBOARDING_HOURS.days] },
  })
  const [serviceAreaInput, setServiceAreaInput] = useState("")
  const [sameAsBusinessPhone, setSameAsBusinessPhone] = useState(hadTrialPhone)
  const [phoneLocked, setPhoneLocked] = useState(hadTrialPhone)
  const [emptyAreaError, setEmptyAreaError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!formData.serviceAreas.length) {
      setEmptyAreaError(true)
      return
    }
    setEmptyAreaError(false)
    const data: BusinessInfo = {
      ...formData,
      businessHours: formData.businessHours ?? {
        open: DEFAULT_ONBOARDING_HOURS.open,
        close: DEFAULT_ONBOARDING_HOURS.close,
        days: [...DEFAULT_ONBOARDING_HOURS.days],
      },
    }
    if (sameAsBusinessPhone && formData.phoneNumber?.trim()) {
      data.ownerPhone = formData.phoneNumber
    }
    onSubmit(data)
  }

  const addServiceArea = () => {
    const value = serviceAreaInput.trim()
    if (!value) return
    const toAdd = [
      ...new Set(
        value
          .split(",")
          .map((s) => s.replace(/\s+/g, " ").trim())
          .filter(Boolean)
      ),
    ]
    const existingLower = new Set(formData.serviceAreas.map((a) => a.toLowerCase()))
    const newAreas = toAdd.filter((a) => !existingLower.has(a.toLowerCase()))
    if (newAreas.length === 0) {
      setServiceAreaInput("")
      return
    }
    setFormData({ ...formData, serviceAreas: [...formData.serviceAreas, ...newAreas] })
    setServiceAreaInput("")
    setEmptyAreaError(false)
  }

  const removeServiceArea = (index: number) => {
    const next = formData.serviceAreas.filter((_, i) => i !== index)
    setFormData({ ...formData, serviceAreas: next })
    if (next.length === 0) setEmptyAreaError(true)
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
        <Label>Service areas (cities/towns you serve) *</Label>
        <p className="text-xs text-muted-foreground">
          Add each city or town where you provide service. Your call assistant will only accept calls for these areas.
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
        {emptyAreaError && formData.serviceAreas.length === 0 && (
          <p className="text-sm text-destructive">Add at least one city or town you serve.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="phoneNumber">
            {phoneLocked ? "Business phone (from trial)" : "Your business phone number *"}
          </Label>
          {phoneLocked && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setPhoneLocked(false)}
            >
              Change
            </button>
          )}
        </div>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber || ""}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
          readOnly={phoneLocked}
          disabled={phoneLocked}
          placeholder="(608) 555-1234"
          className={phoneLocked ? "bg-muted/50" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          {phoneLocked
            ? "Confirmed at trial start. Change only if you need a different business line."
            : "The number customers call today. You'll forward this line to CallGrabbr after setup. One trial per business number."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerPhone">SMS reports contact number</Label>
        {formData.phoneNumber?.trim() && (
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={sameAsBusinessPhone}
              onChange={(e) => {
                const checked = e.target.checked
                setSameAsBusinessPhone(checked)
                setFormData({
                  ...formData,
                  ownerPhone: checked ? formData.phoneNumber || "" : formData.ownerPhone || "",
                })
              }}
              className="rounded"
            />
            Same as business number
          </label>
        )}
        <PhoneInputWithCountry
          id="ownerPhone"
          value={sameAsBusinessPhone ? formData.phoneNumber || "" : formData.ownerPhone || ""}
          onChange={(v) => setFormData({ ...formData, ownerPhone: v })}
          placeholder="(415) 555-9999"
          aria-label="SMS reports contact number"
          disabled={sameAsBusinessPhone}
        />
        <p className="text-xs text-muted-foreground">
          Where to receive SMS call summaries. Changeable later in Settings → Notifications.
        </p>
        <p className="text-xs font-medium text-foreground mt-2">SMS alerts (one-time agreement)</p>
        <SmsConsentCheckbox
          checked={formData.smsConsent ?? false}
          onChange={(checked) => setFormData({ ...formData, smsConsent: checked })}
          businessName={formData.name || "CallGrabbr"}
        />
      </div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {disabled ? "Saving…" : "Finish setup"}
      </Button>
    </form>
  )
}
