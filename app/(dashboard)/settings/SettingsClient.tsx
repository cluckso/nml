"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlowSelector } from "@/components/settings/FlowSelector"
import { Industry } from "@prisma/client"
import { PlanType } from "@prisma/client"
import { hasPrioritySupport, hasBrandedVoice } from "@/lib/plans"
import { Loader2, Volume2 } from "lucide-react"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

interface BusinessData {
  id: string
  name: string
  industry: Industry
  businessLinePhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  serviceAreas: string[]
  businessHours?: { open?: string; close?: string; days?: string[] }
  crmWebhookUrl?: string
  forwardToEmail?: string
  afterHoursEmergencyPhone?: string
  offersRoadsideService?: boolean
  voiceSettings?: { speed?: number; temperature?: number; volume?: number }
}

interface SettingsClientProps {
  business: BusinessData
  planType: PlanType
  hasAgent: boolean
}

export function SettingsClient({ business, planType, hasAgent }: SettingsClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState(business.name)
  const [businessLinePhone, setBusinessLinePhone] = useState(business.businessLinePhone ?? "")
  const [address, setAddress] = useState(business.address ?? "")
  const [city, setCity] = useState(business.city ?? "")
  const [state, setState] = useState(business.state ?? "")
  const [zipCode, setZipCode] = useState(business.zipCode ?? "")
  const [serviceAreas, setServiceAreas] = useState(business.serviceAreas)
  const [serviceAreaInput, setServiceAreaInput] = useState("")
  const [businessHours, setBusinessHours] = useState(business.businessHours ?? { open: "09:00", close: "17:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] })
  const [industry, setIndustry] = useState(business.industry)
  const [offersRoadsideService, setOffersRoadsideService] = useState(business.offersRoadsideService ?? false)
  const [afterHoursEmergencyPhone, setAfterHoursEmergencyPhone] = useState(business.afterHoursEmergencyPhone ?? "")
  const [crmWebhookUrl, setCrmWebhookUrl] = useState(business.crmWebhookUrl ?? "")
  const [forwardToEmail, setForwardToEmail] = useState(business.forwardToEmail ?? "")
  const [voiceSpeed, setVoiceSpeed] = useState(business.voiceSettings?.speed ?? 0.5)
  const [voiceTemperature, setVoiceTemperature] = useState(business.voiceSettings?.temperature ?? 0.5)
  const [voiceVolume, setVoiceVolume] = useState(business.voiceSettings?.volume ?? 0.5)

  const isLocalPlus = planType === "LOCAL_PLUS"
  const isPro = planType === "PRO" || isLocalPlus
  const showAfterHours = isPro && !isLocalPlus
  const showVoiceSliders = hasBrandedVoice(planType)

  const addServiceArea = () => {
    const value = serviceAreaInput.trim()
    if (!value) return
    const toAdd = value.split(",").map((s) => s.trim()).filter(Boolean)
    const existing = new Set(serviceAreas.map((a) => a.toLowerCase()))
    const newAreas = toAdd.filter((a) => !existing.has(a.toLowerCase()))
    if (newAreas.length > 0) setServiceAreas([...serviceAreas, ...newAreas])
    setServiceAreaInput("")
  }

  const removeServiceArea = (i: number) => {
    setServiceAreas(serviceAreas.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          businessLinePhone: businessLinePhone.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zipCode: zipCode.trim() || null,
          serviceAreas,
          businessHours: { open: businessHours.open ?? "09:00", close: businessHours.close ?? "17:00", days: businessHours.days ?? [] },
          industry,
          offersRoadsideService: industry === "AUTO_REPAIR" ? offersRoadsideService : undefined,
          afterHoursEmergencyPhone: showAfterHours ? (afterHoursEmergencyPhone.trim() || null) : undefined,
          crmWebhookUrl: isPro ? (crmWebhookUrl.trim() || null) : undefined,
          forwardToEmail: isPro ? (forwardToEmail.trim() || null) : undefined,
          voiceSettings: showVoiceSliders ? { speed: voiceSpeed, temperature: voiceTemperature, volume: voiceVolume } : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      setSuccess(true)
      if (data.agentSyncFailed) {
        setError("Settings saved, but the AI agent could not be updated. Try again later or contact support.")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Business info</CardTitle>
          <CardDescription>Update name, address, phone, hours. All plans can edit anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Business phone (line to forward)</Label>
              <Input id="phone" type="tel" value={businessLinePhone} onChange={(e) => setBusinessLinePhone(e.target.value)} placeholder="(608) 555-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="WI" maxLength={2} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="53818" />
            </div>
            <div className="space-y-2">
              <Label>Service areas (cities you serve)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {serviceAreas.map((area, i) => (
                  <span key={area} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm">
                    {area}
                    <button type="button" onClick={() => removeServiceArea(i)} className="hover:bg-primary/20 rounded" aria-label={`Remove ${area}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={serviceAreaInput} onChange={(e) => setServiceAreaInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addServiceArea())} placeholder="Add city" />
                <Button type="button" variant="outline" onClick={addServiceArea} disabled={!serviceAreaInput.trim()}>
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business hours</Label>
              <div className="flex gap-4 items-center flex-wrap">
                <Input type="time" value={businessHours.open ?? "09:00"} onChange={(e) => setBusinessHours({ ...businessHours, open: e.target.value })} />
                <span className="text-muted-foreground">to</span>
                <Input type="time" value={businessHours.close ?? "17:00"} onChange={(e) => setBusinessHours({ ...businessHours, close: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map((day) => (
                  <label key={day} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={businessHours.days?.includes(day) ?? false}
                      onChange={(e) => {
                        const days = businessHours.days ?? []
                        const next = e.target.checked ? [...days, day] : days.filter((d) => d !== day)
                        setBusinessHours({ ...businessHours, days: next })
                      }}
                    />
                    <span className="capitalize">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
            {isPro && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM webhook URL (optional)</Label>
                  <Input id="crm" type="url" value={crmWebhookUrl} onChange={(e) => setCrmWebhookUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forward">Forward leads to email (optional)</Label>
                  <Input id="forward" type="email" value={forwardToEmail} onChange={(e) => setForwardToEmail(e.target.value)} placeholder="crm@company.com" />
                </div>
                {showAfterHours && (
                  <div className="space-y-2">
                    <Label htmlFor="afterHours">After-hours emergency phone (Pro)</Label>
                    <Input id="afterHours" type="tel" value={afterHoursEmergencyPhone} onChange={(e) => setAfterHoursEmergencyPhone(e.target.value)} placeholder="+16085551234" />
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation flow</CardTitle>
          <CardDescription>Basic plans use name / number / reason. Pro and Local Plus can choose an industry flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <FlowSelector
            planType={planType}
            currentIndustry={industry}
            currentOffersRoadside={industry === "AUTO_REPAIR" ? offersRoadsideService : undefined}
            onSelect={(ind, roadside) => {
              setIndustry(ind)
              if (ind === "AUTO_REPAIR") setOffersRoadsideService(roadside ?? false)
            }}
            disabled={hasAgent}
          />
          {hasAgent && (
            <p className="text-sm text-muted-foreground mt-4">Flow changes apply when you create a new agent. Existing agent keeps current flow.</p>
          )}
        </CardContent>
      </Card>

      {showVoiceSliders && (
        <Card>
          <CardHeader>
            <CardTitle>Voice (Local Plus)</CardTitle>
            <CardDescription>Adjust speed, temperature, and volume. Preview sample below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Speed</Label>
              <input type="range" min="0" max="1" step="0.05" value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <input type="range" min="0" max="1" step="0.05" value={voiceTemperature} onChange={(e) => setVoiceTemperature(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Volume</Label>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Preview: Sample audio coming soon. Your AI will use these settings on the next agent update.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Settings saved.</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
      </Button>
    </div>
  )
}
