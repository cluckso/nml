-- Founder deal: pay first month, get 11 months free (Stripe coupon handles billing).
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "founderDealRedeemedAt" TIMESTAMP(3);
