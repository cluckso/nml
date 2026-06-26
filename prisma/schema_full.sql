-- CallGrabbr — full database schema (PostgreSQL)
-- Generated from prisma/schema.prisma via: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('HVAC', 'PLUMBING', 'AUTO_REPAIR', 'CHILDCARE', 'ELECTRICIAN', 'HANDYMAN', 'GENERIC');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('STARTER', 'PRO', 'LOCAL_PLUS', 'ELITE');

-- CreateEnum
CREATE TYPE "LeadTag" AS ENUM ('EMERGENCY', 'ESTIMATE', 'FOLLOW_UP', 'GENERAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PAUSED', 'ACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "phoneNumber" TEXT,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "smsConsentAt" TIMESTAMP(3),
    "smsOptedOut" BOOLEAN NOT NULL DEFAULT false,
    "smsOptedOutAt" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "primaryForwardingNumber" TEXT NOT NULL,
    "retellPhoneNumber" TEXT,
    "retellAgentId" TEXT,
    "stripeCustomerId" TEXT,
    "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "businessHours" JSONB,
    "departments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "requiresManualSetup" BOOLEAN NOT NULL DEFAULT false,
    "status" "ClientStatus" NOT NULL DEFAULT 'PAUSED',
    "testCallVerifiedAt" TIMESTAMP(3),
    "crmWebhookUrl" TEXT,
    "forwardToEmail" TEXT,
    "afterHoursEmergencyPhone" TEXT,
    "offersRoadsideService" BOOLEAN,
    "voiceSettings" JSONB,
    "settings" JSONB,
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "planType" "PlanType",
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" "SubscriptionStatus",
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "retellCallId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "callerPhone" TEXT,
    "aiNumberAnswered" TEXT,
    "duration" INTEGER NOT NULL,
    "minutes" DOUBLE PRECISION NOT NULL,
    "transcript" TEXT,
    "summary" TEXT,
    "structuredIntake" JSONB,
    "emergencyFlag" BOOLEAN NOT NULL DEFAULT false,
    "leadTag" "LeadTag",
    "department" TEXT,
    "appointmentRequest" JSONB,
    "callerName" TEXT,
    "issueDescription" TEXT,
    "missedCallRecovery" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "minutesUsed" DOUBLE PRECISION NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "reportedToStripe" BOOLEAN NOT NULL DEFAULT false,
    "stripeUsageRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecycledRetellNumber" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecycledRetellNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");
CREATE INDEX "User_businessId_idx" ON "User"("businessId");
CREATE INDEX "User_supabaseUserId_idx" ON "User"("supabaseUserId");

CREATE UNIQUE INDEX "Business_primaryForwardingNumber_key" ON "Business"("primaryForwardingNumber");
CREATE UNIQUE INDEX "Business_retellPhoneNumber_key" ON "Business"("retellPhoneNumber");
CREATE UNIQUE INDEX "Business_stripeCustomerId_key" ON "Business"("stripeCustomerId");
CREATE UNIQUE INDEX "Business_stripeSubscriptionId_key" ON "Business"("stripeSubscriptionId");
CREATE INDEX "Business_primaryForwardingNumber_idx" ON "Business"("primaryForwardingNumber");
CREATE INDEX "Business_retellPhoneNumber_idx" ON "Business"("retellPhoneNumber");
CREATE INDEX "Business_stripeCustomerId_idx" ON "Business"("stripeCustomerId");
CREATE INDEX "Business_stripeSubscriptionId_idx" ON "Business"("stripeSubscriptionId");
CREATE INDEX "Business_subscriptionStatus_idx" ON "Business"("subscriptionStatus");

CREATE UNIQUE INDEX "Call_retellCallId_key" ON "Call"("retellCallId");
CREATE INDEX "Call_businessId_idx" ON "Call"("businessId");
CREATE INDEX "Call_retellCallId_idx" ON "Call"("retellCallId");
CREATE INDEX "Call_createdAt_idx" ON "Call"("createdAt");
CREATE INDEX "Call_emergencyFlag_idx" ON "Call"("emergencyFlag");
CREATE INDEX "Call_leadTag_idx" ON "Call"("leadTag");

CREATE INDEX "Usage_businessId_idx" ON "Usage"("businessId");
CREATE INDEX "Usage_billingPeriod_idx" ON "Usage"("billingPeriod");
CREATE UNIQUE INDEX "Usage_businessId_billingPeriod_key" ON "Usage"("businessId", "billingPeriod");

CREATE UNIQUE INDEX "RecycledRetellNumber_phoneNumber_key" ON "RecycledRetellNumber"("phoneNumber");
CREATE INDEX "RecycledRetellNumber_releasedAt_idx" ON "RecycledRetellNumber"("releasedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Call" ADD CONSTRAINT "Call_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
