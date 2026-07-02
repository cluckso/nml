import type { FunnelSmsPreview } from "@/lib/funnel/funnel-config"

export type SmsPreviewLead = FunnelSmsPreview

/** Default sample lead for homepage and pages without industry-specific config. */
export const DEFAULT_SMS_PREVIEW: SmsPreviewLead = {
  name: "John Martinez",
  phone: "(555) 234-5678",
  address: "42 Maple St",
  job: "Plumbing leak - kitchen sink",
  urgency: "High",
}
