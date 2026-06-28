"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Lock, Save, Loader2, Check } from "lucide-react"
import Link from "next/link"
import type {
  BusinessSettings,
  SettingsSection,
  IntakeFieldConfig,
  GreetingSettings,
  NotificationSettings,
  CallRoutingSettings,
  RingBeforeAnswerSeconds,
  RingBeforeAnswerRings,
  RingDelayMode,
  RingDelayProfile,
  MissedCallRecoverySettings,
  FollowUpSmsSettings,
  ReputationSettings,
  AvailabilitySettings,
  BookingSettings,
  LeadTagSettings,
  CrmSettings,
  VoiceBrandSettings,
  AiBehaviorSettings,
  ReportSettings,
  QuestionDepth,
} from "@/lib/business-settings"
import { SECTION_LABELS, SECTION_MIN_TIER, SECTION_UPGRADE_DESCRIPTIONS } from "@/lib/business-settings"
import { formatRingDelayLabel, formatScheduledRingDelaySummary } from "@/lib/call-routing"
import { getUpgradeTierLabel, PLAN_VOLUME_TAGS } from "@/lib/plan-labels"
import { PlanType } from "@prisma/client"
import { PhoneInputWithCountry } from "@/components/ui/phone-input-with-country"
import { PlanUpgradeDialog } from "@/components/settings/PlanUpgradeDialog"
import { cn } from "@/lib/utils"

const TABS: { section: SettingsSection; tier: "starter" | "pro" | "local_plus" }[] = [
  { section: "greeting", tier: "starter" },
  { section: "intakeFields", tier: "starter" },
  { section: "availability", tier: "starter" },
  { section: "notifications", tier: "starter" },
  { section: "callRouting", tier: "starter" },
  { section: "missedCallRecovery", tier: "starter" },
  { section: "followUpSms", tier: "pro" },
  { section: "reputation", tier: "pro" },
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

const TIER_GROUP_LABELS = PLAN_VOLUME_TAGS

export function SettingsClient() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [allowed, setAllowed] = useState<SettingsSection[]>([])
  const [planType, setPlanType] = useState<PlanType | null>(null)
  const [notificationPhone, setNotificationPhone] = useState<string | null>(null)
  const [smsConsent, setSmsConsent] = useState(false)
  const [businessPhone, setBusinessPhone] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsSection>("greeting")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [agentPreview, setAgentPreview] = useState<{
    summary?: {
      answerAllCalls?: boolean
      ringDelayLabel?: string
      scheduledRingDelayLabel?: string
      scheduleByBusinessHours?: boolean
      ringBeforeAnswerSeconds?: number
      tone?: string
      questionDepth?: string
    }
    ringDurationMs?: number
  } | null>(null)
  const [agentPreviewVerified, setAgentPreviewVerified] = useState(false)
  const [verifyingAgentPreview, setVerifyingAgentPreview] = useState(false)
  const [upgradeDialogSection, setUpgradeDialogSection] = useState<SettingsSection | null>(null)

  const refreshAgentPreview = useCallback(async (opts?: { markVerified?: boolean }) => {
    try {
      const r = await fetch("/api/settings/agent-preview")
      const d = await r.json()
      if (r.ok) {
        setAgentPreview(d)
        if (opts?.markVerified) setAgentPreviewVerified(true)
        return true
      }
      setAgentPreview(null)
      if (opts?.markVerified) setAgentPreviewVerified(false)
      return false
    } catch {
      setAgentPreview(null)
      if (opts?.markVerified) setAgentPreviewVerified(false)
      return false
    }
  }, [])

  const verifyAgentPreview = useCallback(async () => {
    setVerifyingAgentPreview(true)
    await refreshAgentPreview({ markVerified: true })
    setVerifyingAgentPreview(false)
  }, [refreshAgentPreview])

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => {
        const d = await r.json()
        if (r.ok) {
          setSettings(d.settings)
          setAllowed(d.allowedSections)
          setPlanType(d.planType)
          setNotificationPhone(d.notificationPhone ?? null)
          setSmsConsent(d.smsConsent ?? false)
          setBusinessPhone(d.businessPhone ?? null)
          refreshAgentPreview()
        } else setError(d.error)
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [refreshAgentPreview])

  const save = useCallback(
    async (section: SettingsSection, data: unknown, extra?: Record<string, unknown>) => {
      setSaving(true)
      setSaved(false)
      setError(null)
      try {
        const body = extra ? { [section]: data, ...extra } : { [section]: data }
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const d = await res.json()
        if (res.ok) {
          setSettings(d.settings)
          if (d.notificationPhone !== undefined) setNotificationPhone(d.notificationPhone)
          if (d.smsConsent !== undefined) setSmsConsent(d.smsConsent)
          setSaved(true)
          setAgentPreviewVerified(false)
          setTimeout(() => setSaved(false), 2000)
          refreshAgentPreview()
        } else setError(d.error)
      } catch {
        setError("Failed to save")
      } finally {
        setSaving(false)
      }
    },
    [refreshAgentPreview]
  )

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
  if (!settings) return <div className="py-12 text-center text-destructive">{error || "Could not load settings."}</div>

  const isLocked = (s: SettingsSection) => !allowed.includes(s)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar nav */}
      <nav className="lg:w-60 shrink-0">
        <div className="lg:sticky lg:top-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-2 space-y-4">
          {TABS.map(({ section, tier }, index) => {
            const locked = isLocked(section)
            const prevTier = index > 0 ? TABS[index - 1].tier : null
            const showGroupHeader = tier !== prevTier

            return (
              <div key={section}>
                {showGroupHeader && (
                  <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {TIER_GROUP_LABELS[tier]}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (locked) {
                      setUpgradeDialogSection(section)
                      return
                    }
                    setActiveTab(section)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors",
                    activeTab === section && !locked
                      ? "bg-primary/15 text-primary font-medium shadow-sm"
                      : locked
                      ? "text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  ) : (
                    <span className="w-3.5 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{SECTION_LABELS[section]}</span>
                  {locked && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 border-primary/30 text-primary/90">
                      {getUpgradeTierLabel(tier === "pro" ? PlanType.PRO : PlanType.ELITE)}
                    </Badge>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 mb-4">Settings saved and verified.</p>}
        <AgentPreviewCard
          agentPreview={agentPreview}
          verified={agentPreviewVerified}
          verifying={verifyingAgentPreview}
          onVerify={verifyAgentPreview}
          onSettingsLoad={settings !== null}
        />

        {isLocked(activeTab) ? (
          <LockedSection section={activeTab} />
        ) : (
          <>
            {activeTab === "greeting" && <GreetingSection value={settings.greeting} onSave={(v) => save("greeting", v)} saving={saving} />}
            {activeTab === "intakeFields" && <IntakeFieldsSection value={settings.intakeFields} onSave={(v) => save("intakeFields", v)} saving={saving} />}
            {activeTab === "availability" && <AvailabilitySection value={settings.availability} onSave={(v) => save("availability", v)} saving={saving} />}
            {activeTab === "notifications" && (
              <NotificationsSection
                value={settings.notifications}
                notificationPhone={notificationPhone}
                businessPhone={businessPhone}
                smsConsent={smsConsent}
                onSave={(v, extra) => save("notifications", v, extra)}
                saving={saving}
              />
            )}
            {activeTab === "callRouting" && <CallRoutingSection value={settings.callRouting} onSave={(v) => save("callRouting", v)} saving={saving} />}
            {activeTab === "missedCallRecovery" && <MissedCallRecoverySection value={settings.missedCallRecovery} onSave={(v) => save("missedCallRecovery", v)} saving={saving} />}
            {activeTab === "followUpSms" && <FollowUpSmsSection value={settings.followUpSms} onSave={(v) => save("followUpSms", v)} saving={saving} />}
            {activeTab === "reputation" && <ReputationSection value={settings.reputation} onSave={(v) => save("reputation", v)} saving={saving} />}
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

      <PlanUpgradeDialog
        section={upgradeDialogSection}
        currentPlan={planType}
        open={upgradeDialogSection !== null}
        onOpenChange={(open) => {
          if (!open) setUpgradeDialogSection(null)
        }}
      />
    </div>
  )
}

// ─── AGENT PREVIEW ───────────────────────────────────────────────────────

function AgentPreviewCard({
  agentPreview,
  verified,
  verifying,
  onVerify,
  onSettingsLoad,
}: {
  agentPreview: {
    summary?: {
      answerAllCalls?: boolean
      ringDelayLabel?: string
      scheduledRingDelayLabel?: string
      scheduleByBusinessHours?: boolean
      ringBeforeAnswerSeconds?: number
      tone?: string
      questionDepth?: string
    }
    ringDurationMs?: number
  } | null
  verified: boolean
  verifying: boolean
  onVerify: () => void
  onSettingsLoad: boolean
}) {
  if (!onSettingsLoad) return null
  const summary = agentPreview?.summary
  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span>Agent config preview</span>
          {verified ? (
            <Button
              size="sm"
              disabled
              className="h-8 text-xs gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600 border-emerald-600 cursor-default opacity-100"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Verified
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVerify}
              disabled={verifying}
              className="h-8 text-xs"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Verifying…
                </>
              ) : (
                "Verify"
              )}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Shows what will be sent to your call assistant on each call. Use &quot;Verify&quot; to confirm your settings are applied.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {summary ? (
          <ul className="space-y-1 text-muted-foreground">
            <li>
              {summary.scheduleByBusinessHours
                ? summary.scheduledRingDelayLabel ?? "Scheduled by business hours"
                : summary.answerAllCalls
                  ? "Answer all calls immediately"
                  : `Ring delay: ${summary.ringDelayLabel ?? `${summary.ringBeforeAnswerSeconds ?? 0} sec`}`}
            </li>
            {summary.scheduleByBusinessHours && (
              <li className="text-xs">Active now: {summary.ringDelayLabel ?? "—"}</li>
            )}
            <li>Tone: {summary.tone ?? "—"}</li>
            <li>Question depth: {summary.questionDepth ?? "—"}</li>
            {agentPreview?.ringDurationMs != null && agentPreview.ringDurationMs > 0 && (
              <li className="text-emerald-600">Ring delay applied: {agentPreview.ringDurationMs}ms</li>
            )}
          </ul>
        ) : (
          <p className="text-muted-foreground">Click &quot;Verify&quot; to see what the agent will use.</p>
        )}
      </CardContent>
    </Card>
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
    <Card className="glass-card border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary/80" />
          {SECTION_LABELS[section]}
        </CardTitle>
        <CardDescription>
          {SECTION_UPGRADE_DESCRIPTIONS[section]} Available on the {getUpgradeTierLabel(tier)} plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/billing">Upgrade Now</Link>
        </Button>
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
        <CardDescription>How your call assistant introduces itself on calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business name pronunciation <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input placeholder="e.g. 'Mc-Gee Plumming'" value={d.businessNamePronunciation ?? ""} onChange={(e) => setD({ ...d, businessNamePronunciation: e.target.value || null })} />
          <p className="text-xs text-muted-foreground">Phonetic spelling so your assistant says your name correctly.</p>
        </div>
        <div className="space-y-2">
          <Label>Custom greeting</Label>
          <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Thanks for calling [business]! How can I help you today?" value={d.customGreeting ?? ""} onChange={(e) => setD({ ...d, customGreeting: e.target.value || null })} />
          <p className="text-xs text-muted-foreground">Leave blank for the default. Use [business] to insert your business name.</p>
          {(d.customGreeting ?? "").trim() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -ml-2"
              onClick={() => onSave({ ...d, customGreeting: null })}
              disabled={saving}
            >
              Use default greeting
            </Button>
          )}
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
        <CardDescription>Choose which fields your assistant collects. Mark as required or optional.</CardDescription>
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

function NotificationsSection({
  value,
  notificationPhone: initialPhone,
  businessPhone,
  smsConsent: initialConsent,
  onSave,
  saving,
}: {
  value: NotificationSettings
  notificationPhone: string | null
  businessPhone: string | null
  smsConsent: boolean
  onSave: (v: NotificationSettings, extra?: { notificationPhone?: string; smsConsent?: boolean }) => void
  saving: boolean
}) {
  const [d, setD] = useState(value)
  const [phone, setPhone] = useState(initialPhone ?? "")
  const [sameAsBusiness, setSameAsBusiness] = useState(
    !!businessPhone && (initialPhone ?? "") === businessPhone
  )
  const [consent, setConsent] = useState(initialConsent)
  const [testStatus, setTestStatus] = useState<{ email?: string; sms?: string } | null>(null)

  useEffect(() => {
    setPhone(initialPhone ?? "")
    setSameAsBusiness(!!businessPhone && (initialPhone ?? "") === businessPhone)
    setConsent(initialConsent)
  }, [initialPhone, initialConsent, businessPhone])

  const handleSameAsBusinessChange = (checked: boolean) => {
    setSameAsBusiness(checked)
    if (checked && businessPhone) setPhone(businessPhone)
  }

  const handleSave = () => {
    const finalPhone = sameAsBusiness && businessPhone ? businessPhone : phone.trim() || undefined
    // Only update phone; SMS consent is set once during onboarding, not here
    onSave(d, { notificationPhone: finalPhone })
  }

  const runTest = async (type: "email" | "sms" | "both") => {
    setTestStatus(null)
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (res.ok && data.results) setTestStatus(data.results)
      else setTestStatus({ sms: data.error || "Request failed", email: data.error || "Request failed" })
    } catch {
      setTestStatus({ email: "Request failed", sms: "Request failed" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>How you receive call alerts. Set your phone for text alerts. SMS consent is set once during setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Phone number for SMS alerts</Label>
          {businessPhone && (
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={sameAsBusiness}
                onChange={(e) => handleSameAsBusinessChange(e.target.checked)}
                className="rounded"
              />
              Same as business number
            </label>
          )}
          <PhoneInputWithCountry
            value={sameAsBusiness && businessPhone ? businessPhone : phone}
            onChange={setPhone}
            placeholder="(608) 642-1459"
            aria-label="Phone number for SMS alerts"
            disabled={sameAsBusiness}
          />
          <p className="text-xs text-muted-foreground">Used for text alerts when a call is received. Choose country code, then enter your number.</p>
          {consent && (
            <p className="text-xs text-muted-foreground">You agreed to SMS alerts during setup.</p>
          )}
        </div>
        <Toggle label="SMS alerts" checked={d.smsAlerts} onChange={(v) => setD({ ...d, smsAlerts: v })} />
        <Toggle label="Email alerts" checked={d.emailAlerts} onChange={(v) => setD({ ...d, emailAlerts: v })} />
        <Toggle label="Emergency-only alerts" checked={d.emergencyOnlyAlerts} onChange={(v) => setD({ ...d, emergencyOnlyAlerts: v })} description="Only notify for emergency calls." />
        <Toggle label="Daily digest" checked={d.dailyDigest} onChange={(v) => setD({ ...d, dailyDigest: v })} description="One summary email per day instead of per call." />
        <SaveBtn saving={saving} onClick={handleSave} />
        <div className="pt-2 border-t space-y-2">
          <Label>Test notifications</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => runTest("email")}>Send test email</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => runTest("sms")}>Send test SMS</Button>
          </div>
          {testStatus && (
            <div className="text-sm text-muted-foreground">
              {testStatus.email != null && (
                <p>Email: {testStatus.email === "sent" ? "Sent. Check your inbox (and spam)." : <span className="text-destructive">{testStatus.email}</span>}</p>
              )}
              {testStatus.sms != null && (
                <p>SMS: {testStatus.sms === "sent" ? "Sent. Check your phone." : <span className="text-destructive">{testStatus.sms}</span>}</p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">If test says &quot;sent&quot; but you don&apos;t get the email: check spam, and ensure your Resend domain is verified or set RESEND_FROM_EMAIL in your host env.</p>
        </div>
      </CardContent>
    </Card>
  )
}

const RING_SECOND_OPTIONS: { value: RingBeforeAnswerSeconds; label: string }[] = [
  { value: 5, label: "5 seconds (~1 ring)" },
  { value: 10, label: "10 seconds (~2 rings)" },
  { value: 15, label: "15 seconds (~3 rings)" },
  { value: 20, label: "20 seconds (~4 rings)" },
  { value: 25, label: "25 seconds (~5 rings)" },
  { value: 30, label: "30 seconds (~6 rings)" },
]

const RING_COUNT_OPTIONS: { value: RingBeforeAnswerRings; label: string }[] = [
  { value: 1, label: "1 ring (~5 seconds)" },
  { value: 2, label: "2 rings (~10 seconds)" },
  { value: 3, label: "3 rings (~15 seconds)" },
  { value: 4, label: "4 rings (~20 seconds)" },
  { value: 5, label: "5 rings (~25 seconds)" },
  { value: 6, label: "6 rings (~30 seconds)" },
]

function RingDelayProfileControls({
  profile,
  onChange,
  namePrefix,
}: {
  profile: RingDelayProfile
  onChange: (profile: RingDelayProfile) => void
  namePrefix: string
}) {
  const handleAnswerAllChange = (answerAll: boolean) => {
    onChange({
      ...profile,
      answerAllCalls: answerAll,
      ringBeforeAnswerSeconds: answerAll ? profile.ringBeforeAnswerSeconds : profile.ringBeforeAnswerSeconds || 10,
    })
  }

  return (
    <div className="space-y-4">
      <Toggle
        label="Answer immediately"
        checked={profile.answerAllCalls}
        onChange={handleAnswerAllChange}
        description="When on, your call assistant picks up right away for this schedule window."
      />
      {!profile.answerAllCalls && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="space-y-2">
            <Label>Delay before assistant answers</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={`${namePrefix}-ringDelayMode`}
                  checked={profile.ringDelayMode === "seconds"}
                  onChange={() => onChange({ ...profile, ringDelayMode: "seconds" as RingDelayMode })}
                />
                Seconds
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={`${namePrefix}-ringDelayMode`}
                  checked={profile.ringDelayMode === "rings"}
                  onChange={() => onChange({ ...profile, ringDelayMode: "rings" as RingDelayMode })}
                />
                Number of rings
              </label>
            </div>
          </div>
          {profile.ringDelayMode === "seconds" ? (
            <div className="space-y-2">
              <Label>Seconds to ring</Label>
              <select
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                value={profile.ringBeforeAnswerSeconds}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    ringBeforeAnswerSeconds: Number(e.target.value) as RingBeforeAnswerSeconds,
                  })
                }
              >
                {RING_SECOND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Rings before assistant answers</Label>
              <select
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                value={profile.ringBeforeAnswerRings}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    ringBeforeAnswerRings: Number(e.target.value) as RingBeforeAnswerRings,
                  })
                }
              >
                {RING_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Current: {formatRingDelayLabel(profile)}</p>
        </div>
      )}
    </div>
  )
}

function CallRoutingSection({ value, onSave, saving }: { value: CallRoutingSettings; onSave: (v: CallRoutingSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)

  useEffect(() => {
    setD(value)
  }, [value])

  const handleScheduleToggle = (enabled: boolean) => {
    if (enabled) {
      setD({
        ...d,
        scheduleByBusinessHours: true,
        duringHours: {
          answerAllCalls: d.answerAllCalls,
          ringDelayMode: d.ringDelayMode,
          ringBeforeAnswerSeconds: d.ringBeforeAnswerSeconds,
          ringBeforeAnswerRings: d.ringBeforeAnswerRings,
        },
        afterHours: d.afterHours?.answerAllCalls != null
          ? d.afterHours
          : { ...d.afterHours, answerAllCalls: true, ringDelayMode: d.ringDelayMode, ringBeforeAnswerSeconds: d.ringBeforeAnswerSeconds, ringBeforeAnswerRings: d.ringBeforeAnswerRings },
      })
      return
    }
    setD({ ...d, scheduleByBusinessHours: false })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Routing</CardTitle>
        <CardDescription>
          Control when your call assistant picks up forwarded calls. Forward your business line to your CallGrabbr number at your carrier, then choose whether it answers right away or after a delay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle
          label="Different behavior during vs after business hours"
          checked={d.scheduleByBusinessHours}
          onChange={handleScheduleToggle}
          description="Example: ring 10 seconds during the day so you can answer first, then answer immediately after hours. Uses your Hours & Availability settings."
        />

        {d.scheduleByBusinessHours ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-sm font-medium">During business hours</h4>
              <RingDelayProfileControls
                profile={d.duringHours}
                onChange={(duringHours) => setD({ ...d, duringHours })}
                namePrefix="during"
              />
            </div>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-sm font-medium">After hours & closed days</h4>
              <RingDelayProfileControls
                profile={d.afterHours}
                onChange={(afterHours) => setD({ ...d, afterHours })}
                namePrefix="after"
              />
            </div>
            <p className="text-xs text-muted-foreground">{formatScheduledRingDelaySummary(d)}</p>
          </div>
        ) : (
          <RingDelayProfileControls
            profile={d}
            onChange={(profile) => setD({ ...d, ...profile })}
            namePrefix="default"
          />
        )}

        {!d.scheduleByBusinessHours && !d.answerAllCalls && (
          <p className="text-xs text-muted-foreground">
            Current setting: {formatRingDelayLabel(d)}. Use unconditional forwarding at your carrier so calls reach your CallGrabbr number; this delay controls how long your assistant waits before answering.
          </p>
        )}
        <Toggle label="Forward emergencies" checked={d.emergencyForward} onChange={(v) => setD({ ...d, emergencyForward: v })} description="Immediately forward emergency calls to a phone number." />
        {d.emergencyForward && (
          <div className="space-y-2 pl-6">
            <div className="flex items-center gap-2">
              <Label>Forward to number</Label>
              <Link href="/docs/faq" className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Help
              </Link>
            </div>
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
        <CardDescription>Auto-text callers when a call ends without full capture. Use [Business] for your business name.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Enable missed call text-back" checked={d.enabled} onChange={(v) => setD({ ...d, enabled: v })} />
        {d.enabled && (
          <div className="space-y-2">
            <Label>SMS text-back message</Label>
            <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={d.smsAutoReplyText} onChange={(e) => setD({ ...d, smsAutoReplyText: e.target.value })} />
          </div>
        )}
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function FollowUpSmsSection({ value, onSave, saving }: { value: FollowUpSmsSettings; onSave: (v: FollowUpSmsSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Follow-Up SMS</CardTitle>
        <CardDescription>Send confirmation after capture, then a follow-up if no appointment is booked.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Enable follow-up SMS sequence" checked={d.enabled} onChange={(v) => setD({ ...d, enabled: v })} />
        {d.enabled && (
          <>
            <div className="space-y-2">
              <Label>Confirmation message (optional — leave blank for default)</Label>
              <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={d.confirmationMessage ?? ""} onChange={(e) => setD({ ...d, confirmationMessage: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Follow-up message (optional — leave blank for default)</Label>
              <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={d.followUpMessage ?? ""} onChange={(e) => setD({ ...d, followUpMessage: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Follow-up delay (hours)</Label>
              <Input type="number" min={1} max={72} value={d.followUpDelayHours} onChange={(e) => setD({ ...d, followUpDelayHours: parseInt(e.target.value, 10) || 24 })} />
            </div>
          </>
        )}
        <SaveBtn saving={saving} onClick={() => onSave(d)} />
      </CardContent>
    </Card>
  )
}

function ReputationSection({ value, onSave, saving }: { value: ReputationSettings; onSave: (v: ReputationSettings) => void; saving: boolean }) {
  const [d, setD] = useState(value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Reviews</CardTitle>
        <CardDescription>Request a Google review after you mark an appointment completed. Use {"{reviewUrl}"} in custom messages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Enable review requests" checked={d.reviewRequestEnabled} onChange={(v) => setD({ ...d, reviewRequestEnabled: v })} />
        {d.reviewRequestEnabled && (
          <>
            <div className="space-y-2">
              <Label>Google review link</Label>
              <Input type="url" placeholder="https://g.page/r/..." value={d.googleReviewUrl ?? ""} onChange={(e) => setD({ ...d, googleReviewUrl: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Custom message (optional)</Label>
              <textarea className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={d.reviewRequestMessage ?? ""} onChange={(e) => setD({ ...d, reviewRequestMessage: e.target.value || null })} />
            </div>
          </>
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
        <CardDescription>How thorough your assistant is during intake.</CardDescription>
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
  const [newJobType, setNewJobType] = useState("")
  const [newJobMinutes, setNewJobMinutes] = useState("")
  const rules = d.serviceTimeByJobType ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking & Appointments</CardTitle>
        <CardDescription>Your assistant collects info and schedules within your timeslots. Only offered when caller explicitly asks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Enable appointment booking" checked={d.askForAppointment} onChange={(v) => setD({ ...d, askForAppointment: v })} />
        {d.askForAppointment && (
          <>
            <Toggle label="Only offer when caller asks" checked={d.onlyOfferWhenAsked ?? true} onChange={(v) => setD({ ...d, onlyOfferWhenAsked: v })} description="Most callers get intake only. Scheduling only if they ask." />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default slot (minutes)</Label>
                <Input type="number" min={15} max={480} value={d.defaultAppointmentMinutes ?? 60} onChange={(e) => setD({ ...d, defaultAppointmentMinutes: parseInt(e.target.value) || 60 })} />
                <p className="text-xs text-muted-foreground">When job type is known</p>
              </div>
              <div className="space-y-2">
                <Label>Evaluation slot (minutes)</Label>
                <Input type="number" min={15} max={120} value={d.evaluationAppointmentMinutes ?? 30} onChange={(e) => setD({ ...d, evaluationAppointmentMinutes: parseInt(e.target.value) || 30 })} />
                <p className="text-xs text-muted-foreground">When caller doesn&apos;t know what needs fixing</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slot duration (minutes)</Label>
              <Input type="number" min={15} max={120} value={d.slotDurationMinutes ?? 30} onChange={(e) => setD({ ...d, slotDurationMinutes: parseInt(e.target.value) || 30 })} />
              <p className="text-xs text-muted-foreground">Timeslots from business hours (e.g. 30 = 9:00, 9:30, 10:00…)</p>
            </div>
            <div className="space-y-2">
              <Label>Service time by job type (optional)</Label>
              <p className="text-xs text-muted-foreground">E.g. oil change 30 min, engine work 240 min. Caller must describe the job.</p>
              <div className="space-y-2">
                {rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.jobType}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">{r.minutes} min</span>
                    <button type="button" onClick={() => setD({ ...d, serviceTimeByJobType: rules.filter((_, j) => j !== i) })} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="e.g. oil change" value={newJobType} onChange={(e) => setNewJobType(e.target.value)} className="flex-1" />
                  <Input type="number" placeholder="min" value={newJobMinutes} onChange={(e) => setNewJobMinutes(e.target.value)} className="w-20" />
                  <Button size="sm" variant="outline" onClick={() => { if (newJobType.trim() && newJobMinutes) { setD({ ...d, serviceTimeByJobType: [...rules, { jobType: newJobType.trim().toLowerCase(), minutes: parseInt(newJobMinutes) || 30 }] }); setNewJobType(""); setNewJobMinutes("") } }}>Add</Button>
                </div>
              </div>
            </div>
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
          </>
        )}
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
  const [zapierKey, setZapierKey] = useState<string | null>(null)
  const [zapierPrefix, setZapierPrefix] = useState<string | null>(null)
  const [generatingKey, setGeneratingKey] = useState(false)

  useEffect(() => {
    fetch("/api/integrations/zapier")
      .then((r) => r.json())
      .then((data) => {
        if (data.keyPrefix) setZapierPrefix(data.keyPrefix)
      })
      .catch(console.error)
  }, [])

  const generateZapierKey = async () => {
    setGeneratingKey(true)
    try {
      const res = await fetch("/api/integrations/zapier", { method: "POST" })
      const data = await res.json()
      if (data.apiKey) {
        setZapierKey(data.apiKey)
        setZapierPrefix(data.apiKey.slice(0, 12))
      }
    } finally {
      setGeneratingKey(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM & Integrations</CardTitle>
        <CardDescription>Connect call data to your CRM or Zapier.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-medium">Official Zapier Integration</p>
          <p className="text-xs text-muted-foreground">
            Connect to 6,000+ apps. See setup guide at{" "}
            <Link href="/integrations/zapier" className="text-primary underline">
              /integrations/zapier
            </Link>
          </p>
          {zapierKey ? (
            <div className="space-y-2">
              <Label>Your API key (copy now — shown once)</Label>
              <Input readOnly value={zapierKey} className="font-mono text-xs" />
            </div>
          ) : zapierPrefix ? (
            <p className="text-xs text-muted-foreground">Connected · Key prefix: {zapierPrefix}…</p>
          ) : null}
          <Button size="sm" variant="outline" onClick={generateZapierKey} disabled={generatingKey}>
            {generatingKey ? "Generating…" : zapierPrefix ? "Rotate API Key" : "Generate Zapier API Key"}
          </Button>
        </div>
        <div className="space-y-2">
          <Label>CRM webhook URL</Label>
          <Input placeholder="https://your-crm.com/webhook" value={d.crmWebhookUrl ?? ""} onChange={(e) => setD({ ...d, crmWebhookUrl: e.target.value || null })} />
        </div>
        <div className="space-y-2">
          <Label>Zapier webhook URL (legacy)</Label>
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
        <CardDescription>Fine-tune voice and personality.</CardDescription>
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
        <CardTitle>Call Handling</CardTitle>
        <CardDescription>Advanced call handling controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Slider label="Interrupt tolerance" value={d.interruptTolerance} onChange={(v) => setD({ ...d, interruptTolerance: v })} />
        <div className="space-y-2">
          <Label>Max call length (minutes)</Label>
          <Input type="number" min={1} max={7} value={d.maxCallLengthMinutes} onChange={(e) => setD({ ...d, maxCallLengthMinutes: Math.min(7, Math.max(1, parseInt(e.target.value) || 7)) })} />
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
