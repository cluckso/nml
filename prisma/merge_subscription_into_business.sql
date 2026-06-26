-- Merge Subscription and TrialClaim into Business (one row per business with trial + subscription fields).
-- Run once when moving from separate Subscription/TrialClaim tables to columns on Business.
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS).

-- 1) Ensure Business has subscription columns (idempotent)
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "planType" "PlanType";
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus";
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- 2) Ensure Business has trial columns (idempotent)
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 3) Migrate data from Subscription into Business (if Subscription table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Subscription') THEN
    UPDATE "Business" b
    SET
      "planType" = s."planType",
      "stripeSubscriptionId" = s."stripeSubscriptionId",
      "subscriptionStatus" = s."status",
      "currentPeriodStart" = s."currentPeriodStart",
      "currentPeriodEnd" = s."currentPeriodEnd",
      "cancelAtPeriodEnd" = COALESCE(s."cancelAtPeriodEnd", false)
    FROM "Subscription" s
    WHERE s."businessId" = b.id;
  END IF;
END $$;

-- 4) Drop Subscription table
DROP TABLE IF EXISTS "Subscription";

-- 5) Drop TrialClaim table (trial is now one-per-business via Business.primaryForwardingNumber)
DROP TABLE IF EXISTS "TrialClaim";

-- 6) Unique constraint on Business.stripeSubscriptionId and index on subscriptionStatus (if not already present)
CREATE UNIQUE INDEX IF NOT EXISTS "Business_stripeSubscriptionId_key" ON "Business"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Business_stripeSubscriptionId_idx" ON "Business"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Business_subscriptionStatus_idx" ON "Business"("subscriptionStatus");

-- 7) Ensure primaryForwardingNumber is unique (one trial per number)
CREATE UNIQUE INDEX IF NOT EXISTS "Business_primaryForwardingNumber_key" ON "Business"("primaryForwardingNumber");
