-- Add the 6 Retell numbers to the recycled pool.
-- Run this in Supabase Dashboard → SQL Editor (no DATABASE_URL needed).
-- Safe to run multiple times: existing numbers are skipped.

INSERT INTO "RecycledRetellNumber" (id, "phoneNumber", "releasedAt")
VALUES
  (gen_random_uuid()::text, '+14155285675', now()),
  (gen_random_uuid()::text, '+14159653498', now()),
  (gen_random_uuid()::text, '+14155982098', now()),
  (gen_random_uuid()::text, '+14159914067', now()),
  (gen_random_uuid()::text, '+14159682320', now()),
  (gen_random_uuid()::text, '+14159972506', now())
ON CONFLICT ("phoneNumber") DO NOTHING;
