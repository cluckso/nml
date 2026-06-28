-- Terms of Service / Privacy Policy acceptance (one-time at signup)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);

-- Existing accounts are treated as having accepted prior terms
UPDATE "User" SET "termsAcceptedAt" = "createdAt" WHERE "termsAcceptedAt" IS NULL;
