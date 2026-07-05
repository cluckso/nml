import { Check, X } from "lucide-react"
import { PRICING_TIERS_BY_KEY, HUMAN_RECEPTIONIST_FROM_MONTHLY } from "@/lib/pricing-catalog"
import { PLAN_SOLO_OWNER } from "@/lib/plan-labels"
import { formatCostPerCapturedCall, approxCallsPerMonth } from "@/lib/plan-usage"

const solo = PRICING_TIERS_BY_KEY[PLAN_SOLO_OWNER]
const soloCalls = approxCallsPerMonth(solo.includedMinutes)

type CellValue = boolean | string

interface ComparisonRow {
  label: string
  voicemail: CellValue
  callgrabbr: CellValue
  human: CellValue
}

const ROWS: ComparisonRow[] = [
  { label: "Monthly cost", voicemail: "$0", callgrabbr: `$${solo.price}/mo`, human: `From $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo` },
  {
    label: "Captures lead details",
    voicemail: false,
    callgrabbr: true,
    human: true,
  },
  {
    label: "After-hours coverage",
    voicemail: false,
    callgrabbr: true,
    human: "Extra fees",
  },
  {
    label: "Knows your trade (HVAC, plumbing, etc.)",
    voicemail: false,
    callgrabbr: true,
    human: "Maybe",
  },
  {
    label: "Instant text/email summary",
    voicemail: false,
    callgrabbr: true,
    human: "Delayed",
  },
  {
    label: `Typical capture rate`,
    voicemail: "5–15%",
    callgrabbr: "80–95%",
    human: "80–95%",
  },
  {
    label: `Included volume`,
    voicemail: "Unlimited rings to nowhere",
    callgrabbr: `~${soloCalls} calls/mo`,
    human: "~50–75 min/mo",
  },
]

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-primary mx-auto" aria-label="Yes" />
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/60 mx-auto" aria-label="No" />
  }
  return <span className="text-sm text-foreground/90">{value}</span>
}

export function PricingComparisonTable({ className = "" }: { className?: string }) {
  const perCall = formatCostPerCapturedCall(solo.price, solo.includedMinutes)

  return (
    <div className={className}>
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          Cheaper than losing the job. Smarter than voicemail.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Most shops compare us to voicemail (free) or a human answering service ($235+/mo).
          CallGrabbr sits in the sweet spot — {perCall} at {PLAN_SOLO_OWNER} tier.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left p-4 font-medium text-muted-foreground w-[34%]" scope="col" />
              <th className="p-4 text-center font-semibold w-[22%]" scope="col">
                Voicemail
              </th>
              <th className="p-4 text-center font-semibold w-[22%] bg-primary/5 text-primary" scope="col">
                CallGrabbr
              </th>
              <th className="p-4 text-center font-semibold w-[22%]" scope="col">
                Human answering
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-0">
                <th className="text-left p-4 font-medium text-foreground/90" scope="row">
                  {row.label}
                </th>
                <td className="p-4 text-center">
                  <CellContent value={row.voicemail} />
                </td>
                <td className="p-4 text-center bg-primary/5">
                  <CellContent value={row.callgrabbr} />
                </td>
                <td className="p-4 text-center">
                  <CellContent value={row.human} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
