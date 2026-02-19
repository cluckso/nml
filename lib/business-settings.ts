import { PlanType } from "@prisma/client"

// ─── TYPES ───────────────────────────────────────────────────────────────

/** Intake field config: which fields to capture and whether required */
export interface IntakeFieldConfig {
  name: { enabled: boolean; required: boolean }
  phone: { enabled: boolean; required: boolean }
  address: { enabled: boolean; required: boolean }
  email: { enabled: boolean; required: boolean }
  serviceType: { enabled: boolean; required: boolean }
  urgency: { enabled: boolean; required: boolean }
  budgetRange: { enabled: boolean; required: boolean }
  appointmentPreference: { enabled: boolean; required: boolean }
}

/** After-hours behavior */
export type AfterHoursBehavior = "take_message" | "book_future" | "emergency_redirect"

/** Hours & availability */
export interface AvailabilitySettings {
  businessHours: { open: string; close: string; days: string[] }
  holidayOverrides: { date: string; closed: boolean; note?: string }[]
  afterHoursBehavior: AfterHoursBehavior
}

/** Notification preferences */
export interface NotificationSettings {
  smsAlerts: boolean
  emailAlerts: boolean
  emergencyOnlyAlerts: boolean
  dailyDigest: boolean
}

/** Ring time (seconds) before AI answers — lets you pick up first if you want */
export type RingBeforeAnswerSeconds = 0 | 5 | 10 | 15

/** Call routing rules */
export interface CallRoutingSettings {
  /** Seconds to ring before connecting to the AI (0 = answer immediately). Configurable in dashboard. */
  ringBeforeAnswerSeconds: RingBeforeAnswerSeconds
  emergencyForward: boolean
  emergencyForwardNumber: string | null
  vipCallerList: string[] // E.164 numbers that get forwarded
  repeatCallerPriorityTag: boolean
  spamHandling: "block" | "short_response" | "voicemail"
}

/** Missed call recovery */
export interface MissedCallRecoverySettings {
  enabled: boolean
  smsAutoReplyText: string
}

/** Greeting / voice / brand identity — All tiers */
export interface GreetingSettings {
  businessNamePronunciation: string | null // phonetic spelling
  customGreeting: string | null // full greeting override
  voiceGender: "male" | "female" | null
  voiceStyle: string | null // e.g. "professional", "warm", "casual"
  tone: "formal" | "friendly" | "direct"
}

/** Intake template selection — Pro+ */
export type IntakeTemplate = "hvac" | "plumbing" | "auto_repair" | "childcare" | "electrician" | "handyman" | "generic"

/** Smart question depth — Pro+ */
export type QuestionDepth = "fast" | "standard" | "deep"

/** Service time by job type — e.g. oil change 30 min, engine work 4 hours */
export interface ServiceTimeRule {
  jobType: string // e.g. "oil change", "engine work", "tire rotation"
  minutes: number
}

/** Booking controls — Pro+ */
export interface BookingSettings {
  askForAppointment: boolean
  /** Only offer scheduling when caller explicitly asks. Most callers get intake only; evaluation slot used when asked. */
  onlyOfferWhenAsked: boolean
  /** Default slot length (minutes) when job type is known but not in serviceTimeByJobType */
  defaultAppointmentMinutes: number
  /** Evaluation slot length (minutes) — for callers who don't know what needs fixing. Used only when explicitly asked. */
  evaluationAppointmentMinutes: number
  /** Slot duration (minutes) — timeslots derived from business hours, e.g. 30 = 9:00, 9:30, 10:00... */
  slotDurationMinutes: number
  offerTimeWindows: boolean
  exactSlotVsPreference: "exact" | "preference"
  minNoticeHours: number
  sameDayAllowed: boolean
  emergencyOverride: boolean
  /** Optional: job-type-specific slot lengths. E.g. oil change 30 min, engine work 240 min. */
  serviceTimeByJobType: ServiceTimeRule[]
}

/** Lead tag config — Pro+ */
export interface LeadTagSettings {
  customTags: string[] // e.g. ["emergency", "estimate", "follow_up", "warranty", "maintenance", "new_install"]
  priorityRules: { keyword: string; tag: string }[]
}

/** CRM / workflow hooks — Pro+ */
export interface CrmSettings {
  crmWebhookUrl: string | null
  zapierWebhookUrl: string | null
  emailParsingFormat: "html" | "json" | "text"
  fieldMapping: { callField: string; crmField: string }[]
}

/** Department config — Local Plus */
export interface DepartmentConfig {
  name: string
  greeting: string | null
  intakeQuestions: string[] // extra questions for this department
  notificationTargets: string[] // email or phone for this dept
}

/** Voice & brand controls — Local Plus */
export interface VoiceBrandSettings {
  voicePersona: string | null // preset name
  speed: number // 0-1
  warmth: number // 0-1
  conciseness: number // 0-1
  strictness: number // 0-1 (strict script vs conversational)
  alwaysSay: string[] // required phrases
  neverSay: string[] // banned phrases
  compliancePhrases: string[]
}

/** AI behavior controls — Local Plus */
export interface AiBehaviorSettings {
  interruptTolerance: number // 0-1 (0=never interrupt, 1=always can)
  maxCallLengthMinutes: number
  questionRetryCount: number
  escalateToHumanAfterRetries: boolean
}

/** Reporting customization — Local Plus */
export interface ReportSettings {
  frequency: "daily" | "weekly"
  includeTranscripts: boolean
  includeTags: boolean
  includeRevenueEstimate: boolean
}

// ─── FULL SETTINGS SHAPE ─────────────────────────────────────────────────

export interface BusinessSettings {
  // All tiers
  greeting: GreetingSettings
  intakeFields: IntakeFieldConfig
  availability: AvailabilitySettings
  notifications: NotificationSettings
  callRouting: CallRoutingSettings
  missedCallRecovery: MissedCallRecoverySettings
  // Pro+
  intakeTemplate: IntakeTemplate | null
  questionDepth: QuestionDepth
  booking: BookingSettings
  leadTags: LeadTagSettings
  crm: CrmSettings
  // Local Plus
  departments: DepartmentConfig[]
  voiceBrand: VoiceBrandSettings
  aiBehavior: AiBehaviorSettings
  reporting: ReportSettings
}

// ─── DEFAULTS ────────────────────────────────────────────────────────────

export const DEFAULT_INTAKE_FIELDS: IntakeFieldConfig = {
  name: { enabled: true, required: true },
  phone: { enabled: true, required: true },
  address: { enabled: true, required: false },
  email: { enabled: false, required: false },
  serviceType: { enabled: true, required: false },
  urgency: { enabled: true, required: false },
  budgetRange: { enabled: false, required: false },
  appointmentPreference: { enabled: false, required: false },
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  greeting: {
    businessNamePronunciation: null,
    customGreeting: null,
    voiceGender: null,
    voiceStyle: null,
    tone: "friendly",
  },
  intakeFields: DEFAULT_INTAKE_FIELDS,
  availability: {
    businessHours: { open: "08:00", close: "17:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    holidayOverrides: [],
    afterHoursBehavior: "take_message",
  },
  notifications: {
    smsAlerts: true,
    emailAlerts: true,
    emergencyOnlyAlerts: false,
    dailyDigest: false,
  },
  callRouting: {
    ringBeforeAnswerSeconds: 0,
    emergencyForward: false,
    emergencyForwardNumber: null,
    vipCallerList: [],
    repeatCallerPriorityTag: false,
    spamHandling: "short_response",
  },
  missedCallRecovery: {
    enabled: true,
    smsAutoReplyText: "Thanks for calling! We missed your call but will get back to you shortly.",
  },
  intakeTemplate: null,
  questionDepth: "standard",
  booking: {
    askForAppointment: false,
    onlyOfferWhenAsked: true,
    defaultAppointmentMinutes: 60,
    evaluationAppointmentMinutes: 30,
    slotDurationMinutes: 30,
    offerTimeWindows: false,
    exactSlotVsPreference: "preference",
    minNoticeHours: 2,
    sameDayAllowed: true,
    emergencyOverride: true,
    serviceTimeByJobType: [
      { jobType: "oil change", minutes: 30 },
      { jobType: "tire rotation", minutes: 30 },
      { jobType: "brake job", minutes: 60 },
      { jobType: "engine work", minutes: 240 },
      { jobType: "evaluation", minutes: 30 },
    ],
  },
  leadTags: {
    customTags: ["emergency", "estimate", "follow_up", "general"],
    priorityRules: [
      { keyword: "leak", tag: "emergency" },
      { keyword: "flood", tag: "emergency" },
      { keyword: "no heat", tag: "emergency" },
      { keyword: "gas smell", tag: "emergency" },
      { keyword: "quote", tag: "estimate" },
      { keyword: "estimate", tag: "estimate" },
      { keyword: "price", tag: "estimate" },
    ],
  },
  crm: {
    crmWebhookUrl: null,
    zapierWebhookUrl: null,
    emailParsingFormat: "html",
    fieldMapping: [],
  },
  departments: [],
  voiceBrand: {
    voicePersona: null,
    speed: 0.5,
    warmth: 0.7,
    conciseness: 0.5,
    strictness: 0.3,
    alwaysSay: [],
    neverSay: [],
    compliancePhrases: [],
  },
  aiBehavior: {
    interruptTolerance: 0.5,
    maxCallLengthMinutes: 7,
    questionRetryCount: 2,
    escalateToHumanAfterRetries: false,
  },
  reporting: {
    frequency: "weekly",
    includeTranscripts: true,
    includeTags: true,
    includeRevenueEstimate: false,
  },
}

// ─── PLAN GATING ─────────────────────────────────────────────────────────

export type SettingsSection =
  | "greeting"
  | "intakeFields"
  | "availability"
  | "notifications"
  | "callRouting"
  | "missedCallRecovery"
  | "intakeTemplate"
  | "questionDepth"
  | "booking"
  | "leadTags"
  | "crm"
  | "departments"
  | "voiceBrand"
  | "aiBehavior"
  | "reporting"

const STARTER_SECTIONS: SettingsSection[] = [
  "greeting",
  "intakeFields",
  "availability",
  "notifications",
  "callRouting",
  "missedCallRecovery",
]

const PRO_SECTIONS: SettingsSection[] = [
  ...STARTER_SECTIONS,
  "intakeTemplate",
  "questionDepth",
  "booking",
  "leadTags",
  "crm",
]

const ELITE_SECTIONS: SettingsSection[] = [
  ...PRO_SECTIONS,
  "departments",
  "voiceBrand",
  "aiBehavior",
  "reporting",
]

export function getAllowedSections(planType: PlanType | null | undefined): SettingsSection[] {
  switch (planType) {
    case PlanType.ELITE:
    case PlanType.LOCAL_PLUS:
      return ELITE_SECTIONS
    case PlanType.PRO:
      return PRO_SECTIONS
    case PlanType.STARTER:
    default:
      return STARTER_SECTIONS
  }
}

export function isSectionAllowed(section: SettingsSection, planType: PlanType | null | undefined): boolean {
  return getAllowedSections(planType).includes(section)
}

/** Human-readable section labels */
export const SECTION_LABELS: Record<SettingsSection, string> = {
  greeting: "Greeting & Voice",
  intakeFields: "Intake Fields",
  availability: "Hours & Availability",
  notifications: "Notification Settings",
  callRouting: "Call Routing",
  missedCallRecovery: "Missed Call Recovery",
  intakeTemplate: "Intake Templates",
  questionDepth: "Question Depth",
  booking: "Booking Controls",
  leadTags: "Lead Tags & Rules",
  crm: "CRM & Integrations",
  departments: "Departments",
  voiceBrand: "Voice & Branding",
  aiBehavior: "AI Behavior",
  reporting: "Report Customization",
}

/** Which tier unlocks a section (for upgrade prompts). Elite = custom scripts, multi-location, reporting. */
export const SECTION_MIN_TIER: Record<SettingsSection, PlanType> = {
  greeting: PlanType.STARTER,
  intakeFields: PlanType.STARTER,
  availability: PlanType.STARTER,
  notifications: PlanType.STARTER,
  callRouting: PlanType.STARTER,
  missedCallRecovery: PlanType.STARTER,
  intakeTemplate: PlanType.PRO,
  questionDepth: PlanType.PRO,
  booking: PlanType.PRO,
  leadTags: PlanType.PRO,
  crm: PlanType.PRO,
  departments: PlanType.ELITE,
  voiceBrand: PlanType.ELITE,
  aiBehavior: PlanType.ELITE,
  reporting: PlanType.ELITE,
}

// ─── MERGE HELPER ────────────────────────────────────────────────────────

/** Deep-merge a section update into current settings (avoids wiping sibling fields on partial updates). */
export function mergeSectionInto<T extends Record<string, unknown>>(
  current: T,
  update: Partial<T> | null | undefined
): T {
  if (!update || typeof update !== "object") return current
  const out = { ...current }
  for (const k of Object.keys(update) as (keyof T)[]) {
    const v = update[k]
    if (v === undefined) continue
    const cur = current[k]
    if (typeof v === "object" && v !== null && !Array.isArray(v) && typeof cur === "object" && cur !== null && !Array.isArray(cur)) {
      ;(out as Record<string, unknown>)[k as string] = mergeSectionInto(
        cur as Record<string, unknown>,
        v as Record<string, unknown>
      )
    } else {
      ;(out as Record<string, unknown>)[k as string] = v
    }
  }
  return out
}

/** Deep-merge saved settings over defaults so new fields always exist. */
export function mergeWithDefaults(saved: Partial<BusinessSettings> | null | undefined): BusinessSettings {
  if (!saved) return { ...DEFAULT_SETTINGS }
  return {
    greeting: { ...DEFAULT_SETTINGS.greeting, ...(saved.greeting ?? {}) },
    intakeFields: { ...DEFAULT_SETTINGS.intakeFields, ...(saved.intakeFields ?? {}) },
    availability: { ...DEFAULT_SETTINGS.availability, ...(saved.availability ?? {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(saved.notifications ?? {}) },
    callRouting: { ...DEFAULT_SETTINGS.callRouting, ...(saved.callRouting ?? {}) },
    missedCallRecovery: { ...DEFAULT_SETTINGS.missedCallRecovery, ...(saved.missedCallRecovery ?? {}) },
    intakeTemplate: saved.intakeTemplate ?? DEFAULT_SETTINGS.intakeTemplate,
    questionDepth: saved.questionDepth ?? DEFAULT_SETTINGS.questionDepth,
    booking: { ...DEFAULT_SETTINGS.booking, ...(saved.booking ?? {}) },
    leadTags: { ...DEFAULT_SETTINGS.leadTags, ...(saved.leadTags ?? {}) },
    crm: { ...DEFAULT_SETTINGS.crm, ...(saved.crm ?? {}) },
    departments: saved.departments ?? DEFAULT_SETTINGS.departments,
    voiceBrand: { ...DEFAULT_SETTINGS.voiceBrand, ...(saved.voiceBrand ?? {}) },
    aiBehavior: { ...DEFAULT_SETTINGS.aiBehavior, ...(saved.aiBehavior ?? {}) },
    reporting: { ...DEFAULT_SETTINGS.reporting, ...(saved.reporting ?? {}) },
  }
}
