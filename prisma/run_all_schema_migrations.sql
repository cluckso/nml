-- Run this entire script in Supabase SQL Editor (or any PostgreSQL client).
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS where possible).
-- Fixes: RecycledRetellNumber missing, retellPhoneNumber, settings, smsConsent, etc.

-- ─── 1. Business: Retell number and agent (one number + one agent per business) ─
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "retellPhoneNumber" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "retellAgentId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Business_retellPhoneNumber_key" ON "Business"("retellPhoneNumber");
CREATE INDEX IF NOT EXISTS "Business_retellPhoneNumber_idx" ON "Business"("retellPhoneNumber");

-- ─── 2. Business: settings JSON (greeting, intake, notifications, etc.) ─────
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "settings" JSONB;

-- ─── 3. Business: subscription/trial columns (if not already from merge) ─────
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "planType" "PlanType";
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus";
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "Business_stripeSubscriptionId_key" ON "Business"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Business_stripeSubscriptionId_idx" ON "Business"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Business_subscriptionStatus_idx" ON "Business"("subscriptionStatus");
CREATE UNIQUE INDEX IF NOT EXISTS "Business_primaryForwardingNumber_key" ON "Business"("primaryForwardingNumber");

-- ─── 4. Business: optional columns (flow/voice) ──────────────────────────────
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "offersRoadsideService" BOOLEAN;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "voiceSettings" JSONB;

-- ─── 5. Industry enum: HANDYMAN (requires PostgreSQL 15+; else run once manually)
ALTER TYPE "Industry" ADD VALUE IF NOT EXISTS 'HANDYMAN';

-- ─── 6. User: SMS consent (Twilio compliance) ────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smsConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smsConsentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smsOptedOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smsOptedOutAt" TIMESTAMP(3);

-- ─── 7. RecycledRetellNumber table (required for onboarding) ─────────────────
CREATE TABLE IF NOT EXISTS "RecycledRetellNumber" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "phoneNumber" TEXT NOT NULL UNIQUE,
  "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RecycledRetellNumber_releasedAt_idx" ON "RecycledRetellNumber"("releasedAt");

-- ─── 8. Call: drop redundant phone columns (keep callerPhone only) ───────────
DROP INDEX IF EXISTS "Call_forwardedFromNumber_idx";
ALTER TABLE "Call" DROP COLUMN IF EXISTS "callerNumber";
ALTER TABLE "Call" DROP COLUMN IF EXISTS "forwardedFromNumber";

-- Done. Re-run onboarding; the "RecycledRetellNumber does not exist" error should be gone.
