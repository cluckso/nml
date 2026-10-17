import {
  AVG_JOB_VALUE_HIGH,
  AVG_JOB_VALUE_LOW,
  formatJobValuePromptLine,
} from "@/lib/pricing-catalog"

/**
 * Cost-of-inaction math for the homepage.
 * Uses typical industry hang-up rates — not first-party CallGrabbr stats.
 */
export function LostJobsMath() {
  const missedPerDay = 3
  const hangupRate = 0.8
  const midJob = Math.round((AVG_JOB_VALUE_LOW + AVG_JOB_VALUE_HIGH) / 2)
  const monthlyAtRisk = Math.round(missedPerDay * hangupRate * midJob * 22)

  return (
    <section id="lost-jobs" className="scroll-mt-20">
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">The jobs you never knew you lost</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          You finish the install. Check your phone. Three missed calls — and no voicemails.
          Those homeowners already booked someone who answered.
        </p>

        <div className="max-w-3xl mx-auto rounded-xl border border-border/60 bg-card/50 p-6 sm:p-8 mb-10">
          <p className="text-sm font-semibold text-foreground text-center mb-1">
            Illustrative scenario — not a guaranteed or typical CallGrabbr customer result
          </p>
          <p className="text-sm font-medium text-muted-foreground text-center mb-4">
            Uses typical industry hang-up rates (not CallGrabbr first-party data)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-6">
            <div>
              <p className="text-3xl font-bold text-foreground">{missedPerDay}</p>
              <p className="text-sm text-muted-foreground mt-1">missed calls / busy day</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">80%</p>
              <p className="text-sm text-muted-foreground mt-1">hang up — no voicemail</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                ${AVG_JOB_VALUE_LOW}–${AVG_JOB_VALUE_HIGH}
              </p>
              <p className="text-sm text-muted-foreground mt-1">example trade job value</p>
            </div>
          </div>
          <p className="text-center text-lg font-semibold text-foreground">
            In this example, roughly{" "}
            <span className="text-primary">${monthlyAtRisk.toLocaleString()}+/month</span> could walk
            out the door — before you ever see a voicemail.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Assumptions next to the result: {missedPerDay} missed/day × 80% hang-up × ~${midJob} job
            × ~22 workdays. Your numbers may differ — {formatJobValuePromptLine()}
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto list-none text-center">
          <li className="text-muted-foreground">
            Callers in a bind <strong className="text-foreground">won&apos;t wait on voicemail</strong>
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">{formatJobValuePromptLine()}</strong>
            {" "}That&apos;s what walked away.
          </li>
          <li className="text-muted-foreground">
            After-hours callers are usually <strong className="text-foreground">ready to book</strong>
          </li>
        </ul>
        <p className="text-center font-medium mt-8 text-primary">
          That walk-away cost is why shops stop relying on voicemail.
        </p>
      </div>
    </section>
  )
}
