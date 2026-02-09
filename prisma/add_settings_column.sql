-- Add settings JSON column to Business (stores BusinessSettings: greeting, intake fields, notifications, etc.)
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "settings" JSONB;
