-- First-visit re-engagement email claim column (idempotent send).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstVisitEmailSentAt" TIMESTAMP(3);
