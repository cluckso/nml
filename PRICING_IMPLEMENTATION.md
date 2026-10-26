# Pricing implementation map

Source of truth: `lib/plans.ts` (`MONTHLY_PRICES`, `INCLUDED_MINUTES`, `OVERAGE_RATE_PER_MIN`) and `lib/pricing-catalog.ts` (marketing cards).

- **Plan limits & overage:** `lib/plans.ts` defines `INCLUDED_MINUTES`, `SETUP_FEES`, `OVERAGE_RATE_PER_MIN` ($0.29), and helpers like `getOverageMinutes(planType, minutesUsed)`.
- **Checkout / Stripe price IDs:** env vars in `STRIPE_SETUP.md`. App maps `PlanType` → Stripe price in `lib/stripe.ts`.

## Basic (STARTER) — $99/mo, 250 included minutes

| Feature | Implementation |
| --- | --- |
| 250 call minutes / month | `INCLUDED_MINUTES.STARTER = 250`; overage at $0.29/min reported to Stripe above that. |
| Trade intake + SMS lead | All paid tiers |
| Caller confirmation SMS | `hasSmsToCallers` |
| Cartesia voice, 5 min call cap | `getRetellVoiceConfig(STARTER)` |

## Growth (PRO) — $189/mo, 500 included minutes

| Feature | Implementation |
| --- | --- |
| 500 call minutes / month | `INCLUDED_MINUTES.PRO = 500`; overage only to Stripe. |
| Appointments / follow-up / CRM | `hasAppointmentCapture`, `hasCallerFollowUpSms`, `hasCrmForwarding` |

## Platinum (ELITE) — $279/mo, 1,200 included minutes

| Feature | Implementation |
| --- | --- |
| 1,200 call minutes / month | `INCLUDED_MINUTES.ELITE = 1200`; overage only to Stripe. |
| Branded voice / multi-dept / reports | `hasBrandedVoice`, `hasMultiDepartment`, `hasWeeklyReports` |

## Billing notes

- **Stripe:** Recurring plan price + usage-based overage price ($0.29/min). See `STRIPE_SETUP.md` for current live price IDs.
- **Trial:** 14 days or 40 minutes, whichever comes first; no card.
- **Annual:** 10× monthly (2 months free) when annual price IDs are set.
