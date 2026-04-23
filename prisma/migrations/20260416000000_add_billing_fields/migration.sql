-- Add billing/subscription fields to Business

ALTER TABLE "Business"
  ADD COLUMN IF NOT EXISTS "plan"                   TEXT NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN IF NOT EXISTS "trialEndsAt"             TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "razorpayCustomerId"      TEXT,
  ADD COLUMN IF NOT EXISTS "razorpaySubscriptionId"  TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionStatus"      TEXT,
  ADD COLUMN IF NOT EXISTS "currentPeriodEnd"        TIMESTAMP(3);

-- Set 14-day trial for all existing businesses
UPDATE "Business" SET "trialEndsAt" = NOW() + INTERVAL '14 days' WHERE "trialEndsAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Business_razorpayCustomerId_key"     ON "Business"("razorpayCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Business_razorpaySubscriptionId_key" ON "Business"("razorpaySubscriptionId");
