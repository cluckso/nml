-- Backfill trial fields for existing businesses without a subscription.
-- Run once after deploying the trial schema (add_trial_fields).
-- Sets trialStartedAt = createdAt, trialEndsAt = createdAt + 14 days,
-- and trialMinutesUsed = sum of Call.minutes for that business.

UPDATE "Business" b
SET
  "trialStartedAt" = b."createdAt",
  "trialEndsAt" = b."createdAt" + INTERVAL '14 days',
  "trialMinutesUsed" = COALESCE(
    (SELECT SUM(c."minutes") FROM "Call" c WHERE c."businessId" = b.id),
    0
  )
WHERE b.id NOT IN (SELECT "businessId" FROM "Subscription")
  AND b."trialStartedAt" IS NULL;
