-- Align production DB with Prisma schema (fixes auth/activation 500s).
ALTER TABLE "Business"
  ADD COLUMN IF NOT EXISTS "zapierApiKeyHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Business_zapierApiKeyHash_key"
  ON "Business" ("zapierApiKeyHash");
