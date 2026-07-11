import type { IntakeFieldConfig, IntakeTemplate } from "./business-settings"

export type IntakeTemplateMeta = {
  id: IntakeTemplate
  label: string
  description: string
  /** Extra fields the agent flow collects beyond core toggles */
  industryFields: string[]
  /** Example questions shown in Settings */
  sampleSteps: string[]
}

export const INTAKE_TEMPLATE_OPTIONS: IntakeTemplateMeta[] = [
  {
    id: "hvac",
    label: "HVAC",
    description: "Heating, cooling, and comfort system calls.",
    industryFields: ["Service address", "Urgency / no-heat or no-cool"],
    sampleSteps: ["What's going on with your system?", "Service address", "Best callback number"],
  },
  {
    id: "plumbing",
    label: "Plumbing",
    description: "Leaks, clogs, water heaters, and fixtures.",
    industryFields: ["Service address", "Active leak or emergency"],
    sampleSteps: ["Describe the plumbing issue", "Service address", "Is water still running?"],
  },
  {
    id: "auto_repair",
    label: "Auto Repair",
    description: "Shop intake with vehicle details.",
    industryFields: ["Year, make, model", "Symptoms / drivability"],
    sampleSteps: ["Year, make, and model", "What's the vehicle doing?", "Appointment preference"],
  },
  {
    id: "childcare",
    label: "Childcare",
    description: "Enrollment and scheduling inquiries.",
    industryFields: ["Child age", "Schedule preference"],
    sampleSteps: ["Child's age", "Days or hours needed", "Parent callback number"],
  },
  {
    id: "electrician",
    label: "Electrician",
    description: "Power, panel, and safety-related calls.",
    industryFields: ["Service address", "Safety urgency"],
    sampleSteps: ["What's happening electrically?", "Any sparks, smoke, or outage?", "Service address"],
  },
  {
    id: "handyman",
    label: "Handyman",
    description: "General home repair and small projects.",
    industryFields: ["Service address", "Project scope"],
    sampleSteps: ["What needs to be done?", "Service address", "Preferred timing"],
  },
  {
    id: "generic",
    label: "Generic Booking",
    description: "Flexible intake for any local service business.",
    industryFields: [],
    sampleSteps: ["Reason for the call", "Contact details", "Appointment preference"],
  },
]

const PRESET_FIELDS: Record<IntakeTemplate, IntakeFieldConfig> = {
  hvac: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: true, required: true },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: true, required: true },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
  plumbing: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: true, required: true },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: true, required: true },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
  auto_repair: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: false, required: false },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: true },
    urgency: { enabled: true, required: false },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
  childcare: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: false, required: false },
    email: { enabled: true, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: false, required: false },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: true },
  },
  electrician: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: true, required: true },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: true, required: true },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
  handyman: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: true, required: true },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: true, required: false },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
  generic: {
    name: { enabled: true, required: true },
    phone: { enabled: true, required: true },
    address: { enabled: true, required: false },
    email: { enabled: false, required: false },
    serviceType: { enabled: true, required: false },
    urgency: { enabled: true, required: false },
    budgetRange: { enabled: false, required: false },
    appointmentPreference: { enabled: true, required: false },
  },
}

export function getIntakeTemplateMeta(template: IntakeTemplate | null | undefined): IntakeTemplateMeta {
  const id = template ?? "generic"
  return INTAKE_TEMPLATE_OPTIONS.find((t) => t.id === id) ?? INTAKE_TEMPLATE_OPTIONS[INTAKE_TEMPLATE_OPTIONS.length - 1]
}

export function getIntakeFieldsForTemplate(template: IntakeTemplate | null | undefined): IntakeFieldConfig {
  const id = template ?? "generic"
  return { ...PRESET_FIELDS[id] }
}

export function buildIntakeTemplateGuidance(template: IntakeTemplate | null | undefined): string {
  const meta = getIntakeTemplateMeta(template)
  const extras =
    meta.industryFields.length > 0
      ? ` Also prioritize: ${meta.industryFields.join(", ")}.`
      : ""
  switch (meta.id) {
    case "auto_repair":
      return `Auto repair intake: collect year, make, model, symptoms, and whether the vehicle is drivable. If vague, ask: "Is the vehicle safe to drive?"${extras}`
    case "childcare":
      return `Childcare intake: focus on parent contact, child age, and schedule needs. Ask warmly about enrollment vs existing enrollment.${extras}`
    case "hvac":
      return `HVAC intake: clarify heating/cooling issue, service address, and urgency. If vague, ask: "Is it not heating, not cooling, or something else?" If they mention no heat, extreme heat with no AC, gas smell, or CO, ask one safety question, flag priority for callback, and do not diagnose.${extras}`
    case "plumbing":
      return `Plumbing intake: capture leak or clog details, service address, and whether it is active. If vague, ask: "Is water actively leaking right now?" If flooding or sewage, urge safe shutoff if possible, flag priority for callback, and continue intake without repair advice.${extras}`
    case "electrician":
      return `Electrical intake: note safety concerns first, then problem description and address. If vague, ask: "Any sparks, smoke, or burning smell?"${extras}`
    case "handyman":
      return `Handyman intake: understand project scope, address, and timing. If vague, ask one question about what needs to be done.${extras}`
    default:
      return `General service intake: name, callback number, clear reason for call, and appointment preference when relevant.${extras}`
  }
}
