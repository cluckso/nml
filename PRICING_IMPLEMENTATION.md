# Pricing Features — Implementation Summary

All features from `PRICING_FEATURES.md` are implemented and automated as follows.

## Database (Prisma)

- **Plan limits & overage:** `lib/plans.ts` defines `INCLUDED_MINUTES`, `SETUP_FEES`, `OVERAGE_RATE_PER_MIN` ($0.22), and helpers like `getOverageMinutes(planType, minutesUsed)`.
- **Stripe:** Only **overage** minutes (above included) are reported to Stripe; included minutes are not metered. Requires a Stripe subscription item with a usage-based overage price (set `STRIPE_USAGE_PRICE_ID`). See `STRIPE_SETUP.md`.
- **Lead tagging:** `Call.leadTag` (enum: EMERGENCY, ESTIMATE, FOLLOW_UP, GENERAL), `Call.summary`, `Call.appointmentRequest` (JSON), `Call.department`, `Call.missedCallRecovery`.
- **Business:** `Business.departments`, `Business.crmWebhookUrl`, `Business.forwardToEmail`, `Business.afterHoursEmergencyPhone`.
- **User:** `User.phoneNumber` for SMS alerts to the owner.

**Apply schema:** Run `npx prisma db push` or `npx prisma migrate dev` when the DB is available.

---

## Solo (STARTER) — $99/mo, 300 included minutes

| Feature | Implementation |
|--------|----------------|
| 300 call minutes / month | `INCLUDED_MINUTES.STARTER = 300`; overage at $0.22/min reported to Stripe above that. |
| Call answering (when forwarded) | Retell agent + forwarding number; `lib/prompts.ts` business hours block. |
| Captures name, number, reason | Retell flow + `structuredIntake` in webhook; stored on `Call` (fields depend on caller input). |
| Call summaries via text or email | `sendEmailNotification` (Resend) and `sendSMSNotification` (Twilio) to owner when actionable info exists. |
| Missed-call recovery | Webhook: partial calls set `missedCallRecovery: true`; optional text-back via settings. |
| Custom greeting with business name | Retell flow start node uses business name. |

---

## Team (PRO) — $159/mo, 800 included minutes

| Feature | Implementation |
|--------|----------------|
| 800 call minutes / month | `INCLUDED_MINUTES.PRO = 800`; overage only to Stripe. |
| Industry-optimized intake | Industry-specific prompts in `lib/prompts.ts`; `hasIndustryOptimizedAgents(PRO)`. |
| Appointment request capture | Prompt + webhook stores `Call.appointmentRequest`; `hasAppointmentCapture(PRO)`. |
| Emergency vs non-emergency | `emergencyFlag` and `leadTag` (EMERGENCY); highlighted in notifications. |
| SMS confirmation to callers | `sendSMSToCaller()` when `hasSmsToCallers(planType)`. |
| Call transcripts + summaries | `Call.transcript` and `Call.summary` on call record. |
| Email / CRM forwarding | `forwardToCrm()` when `hasCrmForwarding(planType)`. |

---

## Pro (ELITE / LOCAL_PLUS) — $279/mo, 1,500 included minutes

| Feature | Implementation |
|--------|----------------|
| 1,500 call minutes / month | `INCLUDED_MINUTES.ELITE = 1500`; overage only to Stripe. |
| Multi-department logic | `Call.department` and `Business.departments`; `hasMultiDepartment(ELITE)`. |
| After-hours emergency handling | `afterHoursEmergencyPhone` + prompt logic. |
| Lead tagging | `detectLeadTag()` in webhook; `hasLeadTagging(ELITE)`. |
| Weekly usage & lead reports | `lib/reports.ts` + `POST /api/reports/weekly`; `hasWeeklyReports(ELITE)`. |
| Premium branded voice | `getRetellVoiceConfig()` — ElevenLabs on Team+; Solo uses standard voice. |

---

## Free trial

- **7 days** or **40 included minutes**, whichever comes first (`FREE_TRIAL_MINUTES`, `TRIAL_DAYS`).
- No card required to start (`POST /api/trial/start`).
- No overage billing during trial.

---

## Onboarding & Settings

- **Business hours:** Stored in `Business.businessHours` (JSON).
- **Owner phone (SMS):** Stored in `User.phoneNumber`; requires SMS consent.
- **Advanced (Team / Pro):** Departments, CRM webhook URL, forward-to email, after-hours emergency phone.

---

## Env / Stripe

- **Stripe:** Recurring plan price + usage-based overage price ($0.22/min). See `STRIPE_SETUP.md` for current live price IDs.
- **Cron:** Set `CRON_SECRET` for `POST /api/reports/weekly`.
- **Twilio:** Required for SMS to owner and SMS to callers (Team+).
- **Resend:** Required for email notifications and weekly reports.

---

## Files Touched / Added

- **Core:** `lib/plans.ts`, `lib/pricing-catalog.ts`, `lib/stripe.ts`, `lib/reports.ts`, `app/api/webhooks/retell/route.ts`
- **Docs:** `PRICING_FEATURES.md`, `STRIPE_SETUP.md`, `PRICING_IMPLEMENTATION.md`
