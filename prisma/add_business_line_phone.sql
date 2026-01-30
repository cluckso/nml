-- Add businessLinePhone to Business (user's existing business line for forwarding).
-- Run this in Supabase SQL Editor (or any PostgreSQL client) if you're not using Prisma migrate.

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "businessLinePhone" TEXT;
