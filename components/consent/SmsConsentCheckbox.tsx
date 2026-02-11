"use client"

import Link from "next/link"

interface SmsConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Business name shown in disclosure (use "CallGrabbr" for sign-up, actual name for onboarding) */
  businessName?: string
}

/**
 * Twilio toll-free verification compliant SMS opt-in checkbox.
 * Shows clear disclosure of:
 * - Who is sending messages (CallGrabbr on behalf of the business)
 * - What messages they'll receive
 * - Message frequency
 * - Data rates may apply
 * - How to opt out (STOP)
 * - Links to Privacy Policy and Terms
 */
export function SmsConsentCheckbox({
  checked,
  onChange,
  disabled,
  businessName = "CallGrabbr",
}: SmsConsentCheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 rounded"
        />
        <span className="text-sm">
          I agree to receive SMS/text messages from {businessName} regarding call alerts, lead notifications, and account updates.
        </span>
      </label>
      <p className="text-xs text-muted-foreground pl-6">
        Message frequency varies based on call volume. Message and data rates may apply.
        Reply <strong>STOP</strong> to opt out at any time, or <strong>HELP</strong> for help.
        By checking this box, you consent to receive automated text messages at the phone number provided.
        This consent is not a condition of purchase.
        View our{" "}
        <Link href="/privacy" className="text-primary underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-primary underline">
          Terms of Service
        </Link>.
      </p>
    </div>
  )
}
