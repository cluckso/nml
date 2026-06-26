-- Shared Agent Overhaul: primary_forwarding_number, status, Call fields, TrialClaim rename
-- Run this manually if you have existing data, or use prisma db push for a fresh DB.

-- Add new enum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- Business: add new columns
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "primaryForwardingNumber" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "status" "ClientStatus" NOT NULL DEFAULT 'PAUSED';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "testCallVerifiedAt" TIMESTAMP(3);

-- Backfill primaryForwardingNumber from businessLinePhone where possible
UPDATE "Business" SET "primaryForwardingNumber" = "businessLinePhone" WHERE "businessLinePhone" IS NOT NULL AND ("primaryForwardingNumber" IS NULL OR "primaryForwardingNumber" = '');

-- Placeholder for any row still null (must be unique per row)
UPDATE "Business" b SET "primaryForwardingNumber" = v.n
FROM (
  SELECT id, '+1555000' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::text, 4, '0') AS n
  FROM "Business"
  WHERE "primaryForwardingNumber" IS NULL OR "primaryForwardingNumber" = ''
) v
WHERE b.id = v.id;

-- Drop old Business columns (after backfill)
ALTER TABLE "Business" DROP COLUMN IF EXISTS "phoneNumber";
ALTER TABLE "Business" DROP COLUMN IF EXISTS "businessLinePhone";
ALTER TABLE "Business" DROP COLUMN IF EXISTS "retellAgentId";

-- Make primaryForwardingNumber required and unique
ALTER TABLE "Business" ALTER COLUMN "primaryForwardingNumber" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Business_primaryForwardingNumber_key" ON "Business"("primaryForwardingNumber");
CREATE INDEX IF NOT EXISTS "Business_primaryForwardingNumber_idx" ON "Business"("primaryForwardingNumber");
CREATE INDEX IF NOT EXISTS "Business_status_idx" ON "Business"("status");
DROP INDEX IF EXISTS "Business_retellAgentId_idx";
DROP INDEX IF EXISTS "Business_retellAgentId_key";

-- TrialClaim: rename phoneNumber to primaryForwardingNumber
ALTER TABLE "TrialClaim" RENAME COLUMN "phoneNumber" TO "primaryForwardingNumber";
DROP INDEX IF EXISTS "TrialClaim_phoneNumber_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "TrialClaim_primaryForwardingNumber_key" ON "TrialClaim"("primaryForwardingNumber");
CREATE INDEX IF NOT EXISTS "TrialClaim_primaryForwardingNumber_idx" ON "TrialClaim"("primaryForwardingNumber");

-- Call: add new columns
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "callerNumber" TEXT;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "forwardedFromNumber" TEXT;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "aiNumberAnswered" TEXT;
CREATE INDEX IF NOT EXISTS "Call_forwardedFromNumber_idx" ON "Call"("forwardedFromNumber");
