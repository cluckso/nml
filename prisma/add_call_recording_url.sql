-- Add Retell recording URL for call playback in dashboard/app
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "recordingUrl" TEXT;
