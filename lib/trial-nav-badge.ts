export type TrialNavBadgeVariant = "default" | "warning" | "urgent"

export type TrialNavBadge = {
  label: string
  href: string
  variant: TrialNavBadgeVariant
}

export type TrialNavBadgeInput = {
  isOnTrial: boolean
  hasAgent: boolean
  minutesRemaining: number
  daysRemaining: number
  isExhausted: boolean
  isExpired: boolean
  minutesUsed: number
}

const LOW_MINUTES_THRESHOLD = 10
const CRITICAL_MINUTES_THRESHOLD = 5
const LOW_DAYS_THRESHOLD = 3

/** Nav pill copy + link for logged-in trial users. Returns null when not on trial. */
export function getTrialNavBadge(input: TrialNavBadgeInput): TrialNavBadge | null {
  if (!input.isOnTrial) return null

  const isEnded = input.isExhausted || input.isExpired
  const minutesLeft = Math.ceil(input.minutesRemaining)
  const daysLeft = input.daysRemaining

  if (isEnded) {
    return {
      label: "Trial ended · Turn back on",
      href: "/billing",
      variant: "urgent",
    }
  }

  if (!input.hasAgent) {
    return {
      label: "Trial · Finish setup",
      href: "/dashboard#setup",
      variant: "warning",
    }
  }

  if (minutesLeft <= LOW_MINUTES_THRESHOLD) {
    return {
      label: `Trial · ${minutesLeft} min left`,
      href: "/billing",
      variant: minutesLeft <= CRITICAL_MINUTES_THRESHOLD ? "urgent" : "warning",
    }
  }

  if (daysLeft > 0 && daysLeft <= LOW_DAYS_THRESHOLD) {
    return {
      label: `Trial · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
      href: "/dashboard",
      variant: daysLeft === 1 ? "urgent" : "warning",
    }
  }

  if (daysLeft > 0) {
    return {
      label: `Trial · ${daysLeft} days left`,
      href: "/dashboard",
      variant: "default",
    }
  }

  if (input.minutesUsed === 0) {
    return {
      label: "Trial · Forward your line",
      href: "/dashboard#setup",
      variant: "warning",
    }
  }

  return {
    label: `Trial · ${minutesLeft} min left`,
    href: "/dashboard",
    variant: "default",
  }
}
