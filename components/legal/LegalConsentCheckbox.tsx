import Link from "next/link"

type LegalConsentCheckboxProps = {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  /** Compact styling for auth forms */
  variant?: "default" | "compact"
}

export function LegalConsentCheckbox({
  id = "legal-consent",
  checked,
  onChange,
  className = "",
  variant = "default",
}: LegalConsentCheckboxProps) {
  const wrapperClass =
    variant === "compact"
      ? "flex items-start gap-3 cursor-pointer"
      : "flex items-start gap-3 cursor-pointer rounded-lg border bg-muted/40 p-3"

  return (
    <label htmlFor={id} className={`${wrapperClass} ${className}`.trim()}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
        required
      />
      <span className="text-xs text-muted-foreground leading-relaxed">
        I agree to the{" "}
        <Link href="/terms" className="text-primary underline hover:no-underline" target="_blank">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary underline hover:no-underline" target="_blank">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  )
}
