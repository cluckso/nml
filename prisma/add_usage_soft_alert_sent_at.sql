-- Week 4: once-per-period 80% usage soft alert dedupe flag
ALTER TABLE "Usage" ADD COLUMN IF NOT EXISTS "usageSoftAlertSentAt" TIMESTAMP(3);
