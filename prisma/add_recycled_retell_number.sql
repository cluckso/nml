-- Pool of Retell numbers released by churned/canceled businesses; reused for new signups.
CREATE TABLE IF NOT EXISTS "RecycledRetellNumber" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "phoneNumber" TEXT NOT NULL UNIQUE,
  "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RecycledRetellNumber_releasedAt_idx" ON "RecycledRetellNumber"("releasedAt");
