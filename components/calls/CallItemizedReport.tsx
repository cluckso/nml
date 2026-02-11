/**
 * Itemized call/lead report as a polished two-column table.
 * Shows time, contact info, vehicle (if present), reason, appointment preference, and address fields.
 */
export type StructuredIntake = {
  name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  issue_description?: string | null
  appointment_preference?: string | null
  department?: string | null
  vehicle_year?: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle?: string | null
  [key: string]: string | null | undefined
}

export type CallItemizedReportProps = {
  /** Call time */
  time: Date
  /** From call.callerName or intake.name */
  name: string | null
  /** From call.callerPhone or intake.phone */
  contactNumber: string | null
  /** From call.issueDescription or intake.issue_description */
  reasonForCall: string | null
  /** From intake.appointment_preference or appointmentRequest.notes */
  availabilityForAppt: string | null
  /** Optional vehicle info (auto repair) */
  vehicleYear?: string | null
  vehicleMake?: string | null
  vehicleModel?: string | null
  /** Optional property address (plumbing, HVAC, etc.) */
  address?: string | null
  city?: string | null
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatPhone(phone: string | null): string {
  if (!phone || !phone.trim()) return "—"
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const display = value?.trim() || "—"
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-2.5 pr-4 align-top text-sm font-medium text-muted-foreground whitespace-nowrap w-[40%]">
        {label}
      </td>
      <td className="py-2.5 text-sm text-foreground">{display}</td>
    </tr>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr className="border-b border-border bg-muted/40">
      <td
        colSpan={2}
        className="py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {title}
      </td>
    </tr>
  )
}

export function CallItemizedReport({
  time,
  name,
  contactNumber,
  reasonForCall,
  availabilityForAppt,
  vehicleYear,
  vehicleMake,
  vehicleModel,
  address,
  city,
}: CallItemizedReportProps) {
  const hasVehicle = [vehicleYear, vehicleMake, vehicleModel].some((v) => v?.trim())
  const hasAddress = address?.trim() || city?.trim()

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse">
        <tbody>
          <Row label="Time" value={formatTime(time)} />
          <Row label="Name" value={name} />
          <Row label="Contact Number" value={formatPhone(contactNumber)} />

          {hasVehicle && (
            <>
              <SectionHeader title="Vehicle" />
              <Row label="Year" value={vehicleYear} />
              <Row label="Make" value={vehicleMake} />
              <Row label="Model" value={vehicleModel} />
            </>
          )}

          <Row label="Reason for Call" value={reasonForCall} />
          <Row label="Availability for Appt" value={availabilityForAppt} />

          {hasAddress && (
            <>
              <SectionHeader title="Service address" />
              {address?.trim() && <Row label="Address" value={address} />}
              {city?.trim() && <Row label="City" value={city} />}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Build report props from Call + structuredIntake + appointmentRequest. */
export function buildCallItemizedProps(
  call: {
    createdAt: Date
    callerName: string | null
    callerPhone: string | null
    issueDescription: string | null
    structuredIntake?: StructuredIntake | null
    appointmentRequest?: { notes?: string | null; preferredDays?: string | null; preferredTime?: string | null } | null
  }
): CallItemizedReportProps {
  const intake = call.structuredIntake
  const appt = call.appointmentRequest
  const availability =
    (typeof appt?.notes === "string" && appt.notes.trim()) ||
    (typeof intake?.appointment_preference === "string" && intake.appointment_preference.trim()) ||
    [appt?.preferredDays, appt?.preferredTime].filter(Boolean).join(", ") ||
    null

  return {
    time: call.createdAt,
    name: call.callerName?.trim() || intake?.name?.trim() || null,
    contactNumber: call.callerPhone?.trim() || intake?.phone?.trim() || null,
    reasonForCall: call.issueDescription?.trim() || intake?.issue_description?.trim() || null,
    availabilityForAppt: availability || null,
    vehicleYear: intake?.vehicle_year?.trim() || null,
    vehicleMake: intake?.vehicle_make?.trim() || null,
    vehicleModel: intake?.vehicle_model?.trim() || null,
    address: intake?.address?.trim() || null,
    city: intake?.city?.trim() || null,
  }
}
