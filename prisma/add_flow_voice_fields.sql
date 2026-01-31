-- Add flow/voice fields to Business (run when ready)
-- HANDYMAN to Industry enum, offersRoadsideService, voiceSettings

-- Add new enum value for Industry (PostgreSQL)
ALTER TYPE "Industry" ADD VALUE IF NOT EXISTS 'HANDYMAN';

-- Add columns to Business
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "offersRoadsideService" BOOLEAN;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "voiceSettings" JSONB;
