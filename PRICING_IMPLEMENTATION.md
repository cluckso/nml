# Pricing Features — Implementation Summary

All features from `PRICING_FEATURES.md` are implemented and automated as follows.

## Database (Prisma)

- **Plan limits & overage:** `lib/plans.ts` defines `INCLUDED_MINUTES`, `SETUP_FEES`, `OVERAGE_RATE_PER_MIN`, and helpers like `getOverageMinutes(planType, minutesUsed)`.
- **Stripe:** Only **overage** minutes (above included) are reported to Stripe; included minutes are not metered. Requires a Stripe subscription item with a metered price for overage (set `STRIPE_USAGE_PRICE_ID` to that price ID).
- **Lead tagging:** `Call.leadTag` (enum: EMERGENCY, ESTIMATE, FOLLOW_UP, GENERAL), `Call.summary`, `Call.appointmentRequest` (JSON), `Call.department`, `Call.missedCallRecovery`.
- **Business:** `Business.departments`, `Business.crmWebhookUrl`, `Business.forwardToEmail`, `Business.afterHoursEmergencyPhone`.
- **User:** `User.phoneNumber` for SMS alerts to the owner.

**Apply schema:** Run `npx prisma db push` or `npx prisma migrate dev` when the DB is available.

---

## Starter

| Feature | Implementation |
|--------|----------------|
| Up to 500 call minutes | `INCLUDED_MINUTES.STARTER = 500`; overage reported to Stripe above that. |
| AI answers business / after-hours | `lib/prompts.ts`: `formatBusinessHoursBlock()` injects business hours into the global prompt; AI says “we’re closed” outside hours and still takes info. |
| Captures name, number, reason | Retell flow + `structuredIntake` in webhook; stored on `Call`. |
| Call summaries via text or email | `sendEmailNotification` (Resend) and `sendSMSNotification` (Twilio) to owner; owner phone from `User.phoneNumber`. |
| Missed-call recovery | Retell webhook: on `call_ended` with little/no analysis, we still create/update a call with caller phone (e.g. from `event.call.from_number`), set `missedCallRecovery: true`, and notify owner. |
| Custom greeting with business name | Retell flow start node: “Thanks for calling ${businessName}! …” |

---

## Pro

| Feature | Implementation |
|--------|----------------|
| Up to 1,200 call minutes | `INCLUDED_MINUTES.PRO = 1200`; overage only to Stripe. |
| Custom intake by service type | Industry-specific prompts in `lib/prompts.ts`; flow and variables vary by industry. |
| Appointment request capture | Global prompt: “Before ending, ask if they need an appointment… record appointment_preference.” Webhook extracts and stores `Call.appointmentRequest`. |
| Emergency vs non-emergency routing | `emergencyFlag` and `leadTag` (EMERGENCY); email/SMS highlight emergencies. |
| SMS confirmation to callers | `sendSMSToCaller()` (Twilio) after each call when `hasSmsToCallers(planType)`. |
| Call transcripts + summaries | `Call.transcript` and `Call.summary`; email includes both when present. |
| Email / CRM forwarding | `forwardToCrm()`: POST to `Business.crmWebhookUrl` and/or send lead email to `Business.forwardToEmail` when `hasCrmForwarding(planType)`. |

---

## Local Plus

| Feature | Implementation |
|--------|----------------|
| Up to 2,500 call minutes | `INCLUDED_MINUTES.LOCAL_PLUS = 2500`; overage only to Stripe. |
| Priority call routing | Handled by Retell/platform; app stores plan and can pass priority metadata when integrating. |
| Multi-department logic | Global prompt: “We have departments: X, Y. Ask which department they need and record department.” `Call.department` and `Business.departments` used. |
| After-hours emergency handling | `formatBusinessHoursBlock()` + `afterHoursEmergencyPhone`; prompt says we’ll have someone call back ASAP when emergency + after hours. |
| Lead tagging (emergency, estimate, follow-up) | `detectLeadTag()` in webhook; `Call.leadTag` set for Pro/Local Plus. |
| Weekly usage & lead reports | `lib/reports.ts`: `sendWeeklyReportForBusiness()`, `sendAllWeeklyReports()`. `POST /api/reports/weekly` (auth: `Authorization: Bearer <CRON_SECRET>`). Vercel cron in `vercel.json`: Mondays 9:00. |
| Fully branded AI voice | `createRetellAgent()`: Local Plus uses `voice_id: "11labs-Adam"`; others use `"11labs-Chloe"`. |

---

## Onboarding & Settings

- **Business hours:** Open/close time + days in onboarding form; stored in `Business.businessHours` (JSON).
- **Owner phone (SMS):** “Your phone (for SMS call alerts)” in onboarding; stored in `User.phoneNumber`.
- **Advanced (Pro / Local Plus):** Optional in onboarding form: departments (comma-separated), CRM webhook URL, forward-to email, after-hours emergency phone; stored on `Business`.

---

## Env / Stripe

- **Stripe:** Create a subscription that includes (1) a recurring price for the plan and (2) a **metered** price for overage ($0.20/min). Set `STRIPE_USAGE_PRICE_ID` to the **price ID** of that metered product so the app can find the subscription item and report overage.
- **Cron:** Set `CRON_SECRET` and use the same value in Vercel Cron (or when calling `POST /api/reports/weekly` manually).
- **Twilio:** Required for SMS to owner and SMS to callers (Pro+).
- **Resend:** Required for email notifications and weekly reports.

---

## Files Touched / Added

- **New:** `lib/plans.ts`, `lib/reports.ts`, `app/api/reports/weekly/route.ts`, `vercel.json`, `PRICING_IMPLEMENTATION.md`
- **Updated:** `prisma/schema.prisma`, `lib/stripe.ts`, `lib/retell.ts`, `lib/prompts.ts`, `lib/notifications.ts`, `app/api/webhooks/retell/route.ts`, `app/api/checkout/route.ts`, `app/api/agents/route.ts`, `app/api/onboarding/route.ts`, `components/onboarding/BusinessInfoForm.tsx`, `app/(dashboard)/onboarding/page.tsx`, `.env.example`
