# Testing Usage Tracking

## Programmatic tests

### 1. Unit tests (Vitest)

Run all usage-tracking unit tests:

```bash
npm run test
```

- **`lib/plans.test.ts`** – `toBillableMinutes` (min 1 min per call, round up, clamp), `getIncludedMinutes`, `getOverageMinutes`, `FREE_TRIAL_MINUTES`.
- **`lib/trial.test.ts`** – `getTrialStatus`: minutesUsed, minutesRemaining, isExhausted, isExpired (mocked DB).
- **`lib/__tests__/usage-display.test.ts`** – Same formulas the UI uses: trial display (X / 50), progress percent, billing overage and bar width.

### 2. Programmatic DB / flow check

Run against your real DB (requires `DATABASE_URL`; uses plain Node, no tsx):

```bash
npm run test:usage
```

This runs `node scripts/test-usage-tracking.cjs`. Ensure `.env` exists with `DATABASE_URL` (or set it in the environment). The script uses `dotenv` to load `.env` if the package is installed.

This script:

- Asserts `getTrialStatus(businessId).minutesUsed` matches `Business.trialMinutesUsed` for businesses with trial data.
- Asserts `getTrialStatus(businessId).minutesRemaining` = `FREE_TRIAL_MINUTES - minutesUsed`.
- Logs call aggregate vs `Usage.minutesUsed` for the current billing period.
- Asserts plan math: `getOverageMinutes(plan, included) === 0`, `getOverageMinutes(plan, included + 100) === 100`.

If `DATABASE_URL` is not set, the script exits 0 (skips DB checks).

---

## UI display verification

Usage is shown in:

1. **Dashboard** – Trial card: “Minutes used” with `X / 50` and progress bar; “X minutes remaining” and “Y days left”.
2. **Billing** – “Trial usage” or “Usage This Month”: `X / included` minutes and overage (if paid plan).

To verify manually:

1. Start the app: `npm run dev`.
2. Sign in and ensure you have a business (onboarding done).
3. Open **Dashboard** (`/dashboard`): confirm trial card shows “X / 50” and remaining minutes/days (or that it hides when not on trial).
4. Open **Billing** (`/billing`): confirm “Trial usage” or “Usage This Month” shows the same usage and, for paid plans, overage minutes and cost.

Data source:

- **Trial**: `getTrialStatus(businessId)` → `trial.minutesUsed`, `trial.minutesRemaining` (from `Business.trialMinutesUsed`, `Business.trialEndsAt`).
- **Paid**: `Usage.minutesUsed` for current `billingPeriod` (YYYY-MM), `getIncludedMinutes(planType)`, `getOverageMinutes(planType, minutesUsed)`.
