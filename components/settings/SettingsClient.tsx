"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Lock, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import type {
  BusinessSettings,
  SettingsSection,
  IntakeFieldConfig,
  GreetingSettings,
  NotificationSettings,
  CallRoutingSettings,
  MissedCallRecoverySettings,
  AvailabilitySettings,
  BookingSettings,
  LeadTagSettings,
  CrmSettings,
  VoiceBrandSettings,
  AiBehaviorSettings,
  ReportSettings,
  QuestionDepth,
} from "@/lib/business-settings"
import { SECTION_LABELS, SECTION_MIN_TIER } from "@/lib/business-settings"
import { PlanType } from "@prisma/client"

const TABS: { section: SettingsSection; tier: "starter" | "pro" | "local_plus" }[] = [
  { section: "greeting", tier: "starter" },
  { section: "intakeFields", tier: "starter" },
  { section: "availability", tier: "starter" },
  { section: "notifications", tier: "starter" },
  { section: "callRouting", tier: "starter" },
  { section: "missedCallRecovery", tier: "starter" },
  { section: "intakeTemplate", tier: "pro" },
  { section: "questionDepth", tier: "pro" },
  { section: "booking", tier: "pro" },
  { section: "leadTags", tier: "pro" },
  { section: "crm", tier: "pro" },
  { section: "departments", tier: "local_plus" },
  { section: "voiceBrand", tier: "local_plus" },
  { section: "aiBehavior", tier: "local_plus" },
  { section: "reporting", tier: "local_plus" },
]

export function SettingsClient() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [allowed, setAllowed] = useState<SettingsSection[]>([])
  const [planType, setPlanType] = useState<PlanType | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsSection>("greeting")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => {
        const d = await r.json()
        if (r.ok) {
          setSettings(d.settings)
          setAllowed(d.allowedSections)
          setPlanType(d.planType)
        } else setError(d.error)
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(
    async (section: SettingsSection, data: unknown) => {
      setSaving(true)
      setSaved(false)
      setError(null)
      try {
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [section]: data }),
        })
        const d = await res.json()
        if (res.ok) {
          setSettings(d.settings)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        } else setError(d.error)
      } catch {
        setError("Failed to save")
      } finally {
        setSaving(false)
      }
    },
    []
  )

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
  if (!settings) return <div className="py-12 text-center text-destructive">{error || "Could not load settings."}</div>

  const isLocked = (s: SettingsSection) => !allowed.includes(s)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar nav */}
      <nav className="lg:w-56 shrink-0">
        <div className="space-y-0.5">
          {TABS.map(({ section, tier }) => {
            const locked = isLocked(section)
            return (
              <button
                key={section}
                onClick={() => !locked && setActiveTab(section)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                  activeTab === section
                    ? "bg-primary/10 text-primary font-medium"
                    : locked
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {locked && <Lock className="h-3 w-3 shrink-0" />}
                <span className="truncate">{SECTION_LABELS[section]}</span>
                {locked && (
                  <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">
                    {tier === "pro" ? "Pro" : "Local+"}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 mb-4">Settings saved.</p>}

        {isLocked(activeTab) ? (
          <LockedSection section={activeTab} />
        ) : (
          <>
            {activeTab === "greeting" && <GreetingSection value={settings.greeting} onSave={(v) => save("greeting", v)} saving={saving} />}
            {activeTab === "intakeFields" && <IntakeFieldsSection value={settings.intakeFields} onSave={(v) => save("intakeFields", v)} saving={saving} />}
            {activeTab === "availability" && <AvailabilitySection value={settings.availability} onSave={(v) => save("availability", v)} saving={saving} />}
            {activeTab === "notifications" && <NotificationsSection value={settings.notifications} onSave={(v) => save("notifications", v)} saving={saving} />}
            {activeTab === "callRouting" && <CallRoutingSection value={settings.callRouting} onSave={(v) => save("callRouting", v)} saving={saving} />}
            {activeTab === "missedCallRecovery" && <MissedCallRecoverySection value={settings.missedCallRecovery} onSave={(v) => save("missedCallRecovery", v)} saving={saving} />}
            {activeTab === "intakeTemplate" && <IntakeTemplateSection value={settings.intakeTemplate} onSave={(v) => save("intakeTemplate", v)} saving={saving} />}
            {activeTab === "questionDepth" && <QuestionDepthSection value={settings.questionDepth} onSave={(v) => save("questionDepth", v)} saving={saving} />}
            {activeTab === "booking" && <BookingSection value={settings.booking} onSave={(v) => save("booking", v)} saving={saving} />}
            {activeTab === "leadTags" && <LeadTagsSection value={settings.leadTags} onSave={(v) => save("leadTags", v)} saving={saving} />}
            {activeTab === "crm" && <CrmSection value={settings.crm} onSave={(v) => save("crm", v)} saving={saving} />}
            {activeTab === "departments" && <DepartmentsSection value={settings.departments} onSave={(v) => save("departments", v)} saving={saving} />}
            {activeTab === "voiceBrand" && <VoiceBrandSection value={settings.voiceBrand} onSave={(v) => save("voiceBrand", v)} saving={saving} />}
            {activeTab === "aiBehavior" && <AiBehaviorSection value={settings.aiBehavior} onSave={(v) => save("aiBehavior", v)} saving={saving} />}
            {activeTab === "reporting" && <ReportingSection value={settings.reporting} onSave={(v) => save("reporting", v)} saving={saving} />}
          </>
        )}
      </div>
    </div>
  )
}

// ─── SHARED ──────────────────────────────────────────────────────────────

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} disabled={saving} size="sm" className="mt-4 gap-2">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {saving ? "Saving..." : "Save"}
    </Button>
  )
}

function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 rounded" />
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </label>
  )
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <Label>{label}</Label>
        <span className="text-muted-foreground">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" />
    </div>
  )
}

function LockedSection({ section }: { section: SettingsSection }) {
  const tier = SECTION_MIN_TIER[section]
  return (
    <Card className="border-dashed opacity-70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {SECTION_LABELS[section]}
        </CardTitle>
        <CardDescription>
          This feature requires the {tier === PlanType.PRO ? "Pro" : "Local Plus"} plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/billing">
          <Button variant="outline">Upgrade to {tier === PlanType.PRO ? "Pro" : "Local Plus"}</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── STARTER SECTIONS ────────────────────────────────────────────────────

function GreetingSection({ value, onSave, saving }: { value: GreetingSettings; onSave: (v: GreetingSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Greeting & Voice</CardTitle>
        <CardDescription>How the AI introduces itself on calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business name pronunciation</Label>
          <Input placeholder="e.g. 'Mc-Gee Plumming'" value={d.businessNamePronunciation ?? ""} onChange={(e) => setD({ ...d, businessNamePronunciation: e.target.value || null })} />
          <p className="text-xs text-muted-foreground">Phonetic spelling so the AI says your name correctly.</p>
        </div>
        <div className="space-y-2">
          <Label>Custom greeting</Label>
          <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Thanks for calling [business]! How can I help you today?" value={d.customGreeting ?? ""} onChange={(e) => setD({ ...d, customGreeting: e.target.value || null })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Voice</Label>
            <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.voiceGender ?? ""} onChange={(e) => setD({ ...d, voiceGender: (e.target.value || null) as GreetingSettings["voiceGender"] })}>
              <option value="">Auto</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.tone} onChange={(e) => setD({ ...d, tone: e.target.value as GreetingSettings["tone"] })}>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="direct">Direct</option>
            </select>
          </div>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function IntakeFieldsSection({ value, onSave, saving }: { value: IntakeFieldConfig; onSave: (v: IntakeFieldConfig) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  const fields = Object.keys(d) as (keyof IntakeFieldConfig)[]
  const labels: Record<keyof IntakeFieldConfig, string> = {
    name: "Caller Name",
    phone: "Phone Number",
    address: "Address",
    email: "Email",
    serviceType: "Service Type",
    urgency: "Urgency Level",
    budgetRange: "Budget Range",
    appointmentPreference: "Appointment Preference",
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Intake Fields</CardTitle>
        <CardDescription>Choose which fields the AI collects. Mark as required or optional.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f} className="flex items-center gap-4">
              <input type="checkbox" checked={d[f].enabled} onChange={(e) => setD({ ...d, [f]: { ...d[f], enabled: e.target.checked } })} className="rounded" />
              <span className="text-sm w-40">{labels[f]}</span>
              {d[f].enabled && (
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <input type="checkbox" checked={d[f].required} onChange={(e) => setD({ ...d, [f]: { ...d[f], required: e.target.checked } })} className="rounded" />
                  Required
                </label>
              )}
            </div>
          ))}
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function AvailabilitySection({ value, onSave, saving }: { value: AvailabilitySettings; onSave: (v: AvailabilitySettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours & Availability</CardTitle>
        <CardDescription>Set business hours and after-hours behavior.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Open</Label>
            <Input type="time" value={d.businessHours.open} onChange={(e) => setD({ ...d, businessHours: { ...d.businessHours, open: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>Close</Label>
            <Input type="time" value={d.businessHours.close} onChange={(e) => setD({ ...d, businessHours: { ...d.businessHours, close: e.target.value } })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Days open</Label>
          <div className="flex flex-wrap gap-2">
            {allDays.map((day) => (
              <label key={day} className="flex items-center gap-1 text-sm capitalize">
                <input
                  type="checkbox"
                  checked={d.businessHours.days.includes(day)}
                  onChange={(e) => {
                    const days = e.target.checked ? [...d.businessHours.days, day] : d.businessHours.days.filter((x) => x !== day)
                    setD({ ...d, businessHours: { ...d.businessHours, days } })
                  }}
                  className="rounded"
                />
                {day.slice(0, 3)}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>After-hours behavior</Label>
          <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.afterHoursBehavior} onChange={(e) => setD({ ...d, afterHoursBehavior: e.target.value as AvailabilitySettings["afterHoursBehavior"] })}>
            <option value="take_message">Take message</option>
            <option value="book_future">Book future slot</option>
            <option value="emergency_redirect">Emergency redirect</option>
          </select>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function NotificationsSection({ value, onSave, saving }: { value: NotificationSettings; onSave: (v: NotificationSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>How you receive call alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toggle label="SMS alerts" checked={d.smsAlerts} onChange={(v) => setD({ ...d, smsAlerts: v })} />
        <Toggle label="Email alerts" checked={d.emailAlerts} onChange={(v) => setD({ ...d, emailAlerts: v })} />
        <Toggle label="Emergency-only alerts" checked={d.emergencyOnlyAlerts} onChange={(v) => setD({ ...d, emergencyOnlyAlerts: v })} description="Only notify for emergency calls." />
        <Toggle label="Daily digest" checked={d.dailyDigest} onChange={(v) => setD({ ...d, dailyDigest: v })} description="One summary email per day instead of per call." />
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function CallRoutingSection({ value, onSave, saving }: { value: CallRoutingSettings; onSave: (v: CallRoutingSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Routing</CardTitle>
        <CardDescription>Rules for routing special calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Forward emergencies" checked={d.emergencyForward} onChange={(v) => setD({ ...d, emergencyForward: v })} description="Immediately forward emergency calls to a phone number." />
        {d.emergencyForward && (
          <div className="space-y-2 pl-6">
            <Label>Forward to number</Label>
            <Input type="tel" placeholder="+1 (555) 123-4567" value={d.emergencyForwardNumber ?? ""} onChange={(e) => setD({ ...d, emergencyForwardNumber: e.target.value || null })} />
          </div>
        )}
        <Toggle label="Tag repeat callers as priority" checked={d.repeatCallerPriorityTag} onChange={(v) => setD({ ...d, repeatCallerPriorityTag: v })} />
        <div className="space-y-2">
          <Label>Spam / sales call handling</Label>
          <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.spamHandling} onChange={(e) => setD({ ...d, spamHandling: e.target.value as CallRoutingSettings["spamHandling"] })}>
            <option value="block">Block</option>
            <option value="short_response">Short response + hang up</option>
            <option value="voicemail">Transfer to voicemail</option>
          </select>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function MissedCallRecoverySection({ value, onSave, saving }: { value: MissedCallRecoverySettings; onSave: (v: MissedCallRecoverySettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Missed Call Recovery</CardTitle>
        <CardDescription>Auto-reply to missed calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Enable missed call recovery" checked={d.enabled} onChange={(v) => setD({ ...d, enabled: v })} />
        {d.enabled && (
          <div className="space-y-2">
            <Label>SMS auto-reply text</Label>
            <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={d.smsAutoReplyText} onChange={(e) => setD({ ...d, smsAutoReplyText: e.target.value })} />
          </div>
        )}
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

// ─── PRO SECTIONS ────────────────────────────────────────────────────────

function IntakeTemplateSection({ value, onSave, saving }: { value: string | null; onSave: (v: string | null) => void; saving: boolean }) {
  const [d, setD] = useState(value ?? "generic")
  const templates = [
    { id: "hvac", label: "HVAC" },
    { id: "plumbing", label: "Plumbing" },
    { id: "auto_repair", label: "Auto Repair" },
    { id: "childcare", label: "Childcare" },
    { id: "electrician", label: "Electrician" },
    { id: "handyman", label: "Handyman" },
    { id: "generic", label: "Generic Booking" },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Intake Templates</CardTitle>
        <CardDescription>Choose an industry-optimized intake flow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((t) => (
          <label key={t.id} className="flex items-center gap-2 text-sm">
            <input type="radio" name="template" checked={d === t.id} onChange={() => setD(t.id)} className="rounded-full" />
            {t.label}
          </label>
        ))}
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function QuestionDepthSection({ value, onSave, saving }: { value: QuestionDepth; onSave: (v: QuestionDepth) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Depth</CardTitle>
        <CardDescription>How thorough the AI is during intake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(["fast", "standard", "deep"] as QuestionDepth[]).map((q) => (
          <label key={q} className="flex items-center gap-2 text-sm capitalize">
            <input type="radio" name="depth" checked={d === q} onChange={() => setD(q)} className="rounded-full" />
            {q === "fast" ? "Fast capture (3 questions)" : q === "standard" ? "Standard intake" : "Deep intake"}
          </label>
        ))}
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function BookingSection({ value, onSave, saving }: { value: BookingSettings; onSave: (v: BookingSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Controls</CardTitle>
        <CardDescription>Appointment logic for calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Ask for appointment?" checked={d.askForAppointment} onChange={(v) => setD({ ...d, askForAppointment: v })} />
        <Toggle label="Offer time windows?" checked={d.offerTimeWindows} onChange={(v) => setD({ ...d, offerTimeWindows: v })} />
        <div className="space-y-2">
          <Label>Slot precision</Label>
          <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.exactSlotVsPreference} onChange={(e) => setD({ ...d, exactSlotVsPreference: e.target.value as "exact" | "preference" })}>
            <option value="exact">Exact time slot</option>
            <option value="preference">Preference only</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Minimum notice (hours)</Label>
          <Input type="number" min={0} value={d.minNoticeHours} onChange={(e) => setD({ ...d, minNoticeHours: parseInt(e.target.value) || 0 })} />
        </div>
        <Toggle label="Allow same-day" checked={d.sameDayAllowed} onChange={(v) => setD({ ...d, sameDayAllowed: v })} />
        <Toggle label="Emergency override (bypass rules)" checked={d.emergencyOverride} onChange={(v) => setD({ ...d, emergencyOverride: v })} />
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function LeadTagsSection({ value, onSave, saving }: { value: LeadTagSettings; onSave: (v: LeadTagSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  const [newTag, setNewTag] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newRuleTag, setNewRuleTag] = useState("")
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Tags & Rules</CardTitle>
        <CardDescription>Customize tags and auto-tagging rules.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Custom tags</Label>
          <div className="flex flex-wrap gap-2">
            {d.customTags.map((t, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {t}
                <button onClick={() => setD({ ...d, customTags: d.customTags.filter((_, j) => j !== i) })} className="text-xs ml-1 hover:text-destructive">&times;</button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="new tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="w-40" />
            <Button size="sm" variant="outline" onClick={() => { if (newTag.trim()) { setD({ ...d, customTags: [...d.customTags, newTag.trim()] }); setNewTag("") } }}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Priority rules</Label>
          {d.priorityRules.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">IF keyword =</span>
              <code className="bg-muted px-1 rounded">{r.keyword}</code>
              <span className="text-muted-foreground">→ tag</span>
              <Badge variant="outline">{r.tag}</Badge>
              <button onClick={() => setD({ ...d, priorityRules: d.priorityRules.filter((_, j) => j !== i) })} className="text-xs text-destructive">&times;</button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="keyword" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} className="w-28" />
            <Input placeholder="tag" value={newRuleTag} onChange={(e) => setNewRuleTag(e.target.value)} className="w-28" />
            <Button size="sm" variant="outline" onClick={() => { if (newKeyword.trim() && newRuleTag.trim()) { setD({ ...d, priorityRules: [...d.priorityRules, { keyword: newKeyword.trim(), tag: newRuleTag.trim() }] }); setNewKeyword(""); setNewRuleTag("") } }}>Add</Button>
          </div>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function CrmSection({ value, onSave, saving }: { value: CrmSettings; onSave: (v: CrmSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM & Integrations</CardTitle>
        <CardDescription>Connect call data to your CRM or Zapier.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>CRM webhook URL</Label>
          <Input placeholder="https://your-crm.com/webhook" value={d.crmWebhookUrl ?? ""} onChange={(e) => setD({ ...d, crmWebhookUrl: e.target.value || null })} />
        </div>
        <div className="space-y-2">
          <Label>Zapier webhook URL</Label>
          <Input placeholder="https://hooks.zapier.com/..." value={d.zapierWebhookUrl ?? ""} onChange={(e) => setD({ ...d, zapierWebhookUrl: e.target.value || null })} />
        </div>
        <div className="space-y-2">
          <Label>Email format</Label>
          <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.emailParsingFormat} onChange={(e) => setD({ ...d, emailParsingFormat: e.target.value as CrmSettings["emailParsingFormat"] })}>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="text">Plain text</option>
          </select>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

// ─── LOCAL PLUS SECTIONS ─────────────────────────────────────────────────

function DepartmentsSection({ value, onSave, saving }: { value: any[]; onSave: (v: any[]) => void; saving: boolean }) {
  const [d, setD] = useState(value || [])
  const addDept = () => setD([...d, { name: "", greeting: null, intakeQuestions: [], notificationTargets: [] }])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments</CardTitle>
        <CardDescription>Route callers to specific departments with custom greetings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {d.map((dept: any, i: number) => (
          <div key={i} className="border rounded p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input placeholder="Department name" value={dept.name} onChange={(e) => { const n = [...d]; n[i] = { ...dept, name: e.target.value }; setD(n) }} />
              <Button size="sm" variant="destructive" onClick={() => setD(d.filter((_: any, j: number) => j !== i))}>Remove</Button>
            </div>
            <Input placeholder="Custom greeting (optional)" value={dept.greeting ?? ""} onChange={(e) => { const n = [...d]; n[i] = { ...dept, greeting: e.target.value || null }; setD(n) }} />
            <Input placeholder="Notification emails/phones (comma-separated)" value={(dept.notificationTargets || []).join(", ")} onChange={(e) => { const n = [...d]; n[i] = { ...dept, notificationTargets: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }; setD(n) }} />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addDept}>Add department</Button>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function VoiceBrandSection({ value, onSave, saving }: { value: VoiceBrandSettings; onSave: (v: VoiceBrandSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice & Branding</CardTitle>
        <CardDescription>Fine-tune the AI voice personality.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Slider label="Speed" value={d.speed} onChange={(v) => setD({ ...d, speed: v })} />
        <Slider label="Warmth" value={d.warmth} onChange={(v) => setD({ ...d, warmth: v })} />
        <Slider label="Conciseness" value={d.conciseness} onChange={(v) => setD({ ...d, conciseness: v })} />
        <Slider label="Script strictness (low = conversational)" value={d.strictness} onChange={(v) => setD({ ...d, strictness: v })} />
        <div className="space-y-2">
          <Label>Words/phrases to always say (one per line)</Label>
          <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={d.alwaysSay.join("\n")} onChange={(e) => setD({ ...d, alwaysSay: e.target.value.split("\n").filter(Boolean) })} />
        </div>
        <div className="space-y-2">
          <Label>Words/phrases to never say (one per line)</Label>
          <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={d.neverSay.join("\n")} onChange={(e) => setD({ ...d, neverSay: e.target.value.split("\n").filter(Boolean) })} />
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function AiBehaviorSection({ value, onSave, saving }: { value: AiBehaviorSettings; onSave: (v: AiBehaviorSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Behavior</CardTitle>
        <CardDescription>Advanced call handling controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Slider label="Interrupt tolerance" value={d.interruptTolerance} onChange={(v) => setD({ ...d, interruptTolerance: v })} />
        <div className="space-y-2">
          <Label>Max call length (minutes)</Label>
          <Input type="number" min={1} max={60} value={d.maxCallLengthMinutes} onChange={(e) => setD({ ...d, maxCallLengthMinutes: parseInt(e.target.value) || 10 })} />
        </div>
        <div className="space-y-2">
          <Label>Question retry count</Label>
          <Input type="number" min={0} max={5} value={d.questionRetryCount} onChange={(e) => setD({ ...d, questionRetryCount: parseInt(e.target.value) || 0 })} />
        </div>
        <Toggle label="Escalate to human after retries" checked={d.escalateToHumanAfterRetries} onChange={(v) => setD({ ...d, escalateToHumanAfterRetries: v })} />
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function ReportingSection({ value, onSave, saving }: { value: ReportSettings; onSave: (v: ReportSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Customization</CardTitle>
        <CardDescription>What your periodic reports include.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Frequency</Label>
          <select className="w-full rounded border border-input bg-background px-3 py-2 text-sm" value={d.frequency} onChange={(e) => setD({ ...d, frequency: e.target.value as ReportSettings["frequency"] })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <Toggle label="Include transcripts" checked={d.includeTranscripts} onChange={(v) => setD({ ...d, includeTranscripts: v })} />
        <Toggle label="Include lead tags" checked={d.includeTags} onChange={(v) => setD({ ...d, includeTags: v })} />
        <Toggle label="Include revenue estimate" checked={d.includeRevenueEstimate} onChange={(v) => setD({ ...d, includeRevenueEstimate: v })} />
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}
