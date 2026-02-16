"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY_CODE,
  parseE164,
  toE164,
} from "@/lib/country-codes"

export interface PhoneInputWithCountryProps {
  value: string
  onChange: (e164: string) => void
  id?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  "aria-label"?: string
}

/**
 * Phone input with country code dropdown. Default: +1.
 * Value/onChange use E.164 (e.g. +16085551234).
 */
export function PhoneInputWithCountry({
  value,
  onChange,
  id,
  placeholder = "(415) 555-1234",
  className,
  inputClassName,
  disabled,
  "aria-label": ariaLabel,
}: PhoneInputWithCountryProps) {
  const parsed = React.useMemo(() => parseE164(value), [value])
  const [countryCode, setCountryCode] = React.useState(parsed.countryCode)
  const [national, setNational] = React.useState(parsed.national)

  // Sync from controlled value when it changes externally
  React.useEffect(() => {
    const p = parseE164(value)
    setCountryCode(p.countryCode)
    setNational(p.national)
  }, [value])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value || DEFAULT_COUNTRY_CODE
    setCountryCode(code)
    const next = toE164(code, national)
    if (next) onChange(next)
  }

  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setNational(v)
    const next = toE164(countryCode, v)
    onChange(next)
  }

  // If current countryCode isn't in the list (e.g. parsed from E.164), use first match by numeric code
  const selectValue = COUNTRY_DIAL_CODES.some((c) => c.code === countryCode)
    ? countryCode
    : (COUNTRY_DIAL_CODES.find((c) => c.code.replace(/\D/g, "") === countryCode.replace(/\D/g, ""))?.code ?? DEFAULT_COUNTRY_CODE)

  // One option per numeric dial code (avoid duplicate +353 etc in dropdown)
  const options = React.useMemo(() => {
    const seen = new Set<string>()
    return COUNTRY_DIAL_CODES.filter(({ code }) => {
      const key = code.replace(/\D/g, "")
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [])

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        aria-label={ariaLabel ? `${ariaLabel} country code` : "Country code"}
        value={options.some((c) => c.code === selectValue) ? selectValue : (options.find((c) => c.code.replace(/\D/g, "") === selectValue.replace(/\D/g, ""))?.code ?? DEFAULT_COUNTRY_CODE)}
        onChange={(e) => {
          const code = e.target.value || DEFAULT_COUNTRY_CODE
          setCountryCode(code)
          const next = toE164(code, national)
          if (next) onChange(next)
        }}
        disabled={disabled}
        className="w-[min(10rem,140px)] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map(({ code, label }) => (
          <option key={code} value={code}>
            +{code}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder={placeholder}
        value={national}
        onChange={handleNationalChange}
        disabled={disabled}
        className={cn("flex-1", inputClassName)}
        aria-label={ariaLabel}
      />
    </div>
  )
}
