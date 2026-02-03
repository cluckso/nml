-- Add retellPhoneNumber column to Business
-- This is the business's dedicated Retell phone number (the AI number they own)
-- Used to identify which business a call is for based on to_number in webhooks

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "retellPhoneNumber" TEXT;

-- Create unique constraint and index
CREATE UNIQUE INDEX IF NOT EXISTS "Business_retellPhoneNumber_key" ON "Business"("retellPhoneNumber");
CREATE INDEX IF NOT EXISTS "Business_retellPhoneNumber_idx" ON "Business"("retellPhoneNumber");
