/** Mirror of web INDUSTRIES values (Prisma Industry enum). */
export const INDUSTRIES = [
  { value: 'HVAC', label: 'HVAC' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'HANDYMAN', label: 'Handyman / Repairs' },
  { value: 'AUTO_REPAIR', label: 'Auto Repair' },
  { value: 'CHILDCARE', label: 'Childcare' },
  { value: 'GENERIC', label: 'Other' },
] as const

export const SECTION_LABELS: Record<string, string> = {
  greeting: 'Greeting & Voice',
  intakeFields: 'What we capture',
  availability: 'Hours & Availability',
  notifications: 'Notification Settings',
  callRouting: 'Call Routing',
  missedCallRecovery: 'Incomplete Call Text-Back',
  followUpSms: 'Lead Follow-Up SMS',
  reputation: 'Google Reviews',
  intakeTemplate: 'Intake Templates',
  questionDepth: 'Question Depth',
  booking: 'Booking Controls',
  capacity: 'Capacity Limits',
  leadTags: 'Lead Tags & Rules',
  crm: 'CRM & Integrations',
  departments: 'Departments',
  voiceBrand: 'Voice & Branding',
  aiBehavior: 'Call Handling',
  reporting: 'Report Customization',
}

export const DEFAULT_ONBOARDING_HOURS = {
  open: '09:00',
  close: '17:00',
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
}
