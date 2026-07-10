-- Run in Supabase SQL Editor (project sbfwaopvqpfgjfdzxnaq) after fixing Vercel DATABASE_URL.
-- Safe to re-run: uses IF NOT EXISTS.

ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "capacityDeclineSmsSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "incompleteTextBackReplyAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "callerConfirmationSentAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "followUpSentAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "missedCallTextBackSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "notificationSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "missedCallRecovery" BOOLEAN NOT NULL DEFAULT false;
