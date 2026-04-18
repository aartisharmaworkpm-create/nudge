-- AlterTable: Business — add PayPal subscription + payment provider
ALTER TABLE "Business"
  ADD COLUMN IF NOT EXISTS "paymentProvider"      TEXT,
  ADD COLUMN IF NOT EXISTS "paypalSubscriptionId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Business_paypalSubscriptionId_key"
  ON "Business"("paypalSubscriptionId");

-- AlterTable: Transaction — add PayPal fields, make razorpayPaymentId optional, add provider
ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "provider"             TEXT NOT NULL DEFAULT 'RAZORPAY',
  ADD COLUMN IF NOT EXISTS "paypalOrderId"        TEXT,
  ADD COLUMN IF NOT EXISTS "paypalSubscriptionId" TEXT;

-- Make razorpayPaymentId nullable (was NOT NULL before)
ALTER TABLE "Transaction"
  ALTER COLUMN "razorpayPaymentId" DROP NOT NULL;

-- Drop old unique index on razorpayPaymentId and recreate as partial (only when not null)
DROP INDEX IF EXISTS "Transaction_razorpayPaymentId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_razorpayPaymentId_key"
  ON "Transaction"("razorpayPaymentId") WHERE "razorpayPaymentId" IS NOT NULL;

-- Unique index for paypalOrderId
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_paypalOrderId_key"
  ON "Transaction"("paypalOrderId") WHERE "paypalOrderId" IS NOT NULL;
