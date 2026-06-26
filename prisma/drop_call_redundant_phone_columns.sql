-- Consolidate Call phone columns: keep callerPhone only; drop callerNumber and forwardedFromNumber.
-- Run in Supabase SQL Editor (or any PostgreSQL client) after deploying the schema change.

DROP INDEX IF EXISTS "Call_forwardedFromNumber_idx";
ALTER TABLE "Call" DROP COLUMN IF EXISTS "callerNumber";
ALTER TABLE "Call" DROP COLUMN IF EXISTS "forwardedFromNumber";
