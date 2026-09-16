import { Check, X } from "lucide-react"
import { PRICING_TIERS_BY_KEY, HUMAN_RECEPTIONIST_FROM_MONTHLY } from "@/lib/pricing-catalog"
import { PLAN_BASIC } from "@/lib/plan-labels"
import { formatCostPerCapturedCall, approxCallsPerMonth } from "@/lib/plan-usage"

const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
const basicCalls = approxCallsPerMonth(basic.includedMinutes)

type CellValue = boolean | string

interface ComparisonRow {
  label: string
  voicemail: CellValue
  callgrabbr: CellValue
  human: CellValue
}

const ROWS: ComparisonRow[] = [
  { label: "Monthly cost", voicemail: "$0", callgrabbr: `$${basic.price}/mo`, human: `From $${HUMAN_RECEPTIONIST_FROM_MONTHLY}/mo` },
  {
    label: "Built to capture trade jobs (name, address, urgency, time)",
    voicemail: false,
    callgrabbr: true,
    human: "Maybe",
  },
  {
    label: "Captures lead details",
    voicemail: false,
    callgrabbr: true,
    human: true,
  },
  {
    label: "Missed-only / lead-insurance plan",
    voicemail: false,
    callgrabbr: true,
    human: "Rarely",
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
    label: "Instant SMS lead (seconds)",
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
    callgrabbr: `~${basicCalls} calls/mo`,
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
  const perCall = formatCostPerCapturedCall(basic.price, basic.includedMinutes)

  return (
    <div className={className}>
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          Revenue capture — not a receptionist seat
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Most shops compare us to voicemail (free, but most callers hang up) or a human answering service ($235+/mo).
          CallGrabbr is missed-call lead capture — {perCall} at {PLAN_BASIC} lead insurance.
        </p>
      </div>

      <div className="md:hidden space-y-4">
        {ROWS.map((row) => (
          <div key={row.label} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <p className="font-medium text-foreground mb-3">{row.label}</p>
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <dt className="text-muted-foreground mb-1">Voicemail</dt>
                <dd>
                  <CellContent value={row.voicemail} />
                </dd>
              </div>
              <div className="rounded-md bg-primary/5 py-1">
                <dt className="text-primary mb-1">CallGrabbr</dt>
                <dd>
                  <CellContent value={row.callgrabbr} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Human</dt>
                <dd>
                  <CellContent value={row.human} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left p-4 font-medium text-muted-foreground w-[34%]" scope="col" />
              <th className="p-4 text-center font-semibold w-[22%]" scope="col">
                Voicemail
              </th>
              <th className="p-4 text-center font-semibold w-[22%] bg-primary/5 text-primary" scope="col">
                CallGrabbr
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">Revenue capture</span>
              </th>
              <th className="p-4 text-center font-semibold w-[22%]" scope="col">
                Human receptionist
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
