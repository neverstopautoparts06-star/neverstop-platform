-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'PAYMENT_PENDING', 'PAID', 'COD_CONFIRMED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'COD';
ALTER TYPE "PaymentMethod" ADD VALUE 'MOCK_QR';
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYOS';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "city" TEXT,
ADD COLUMN     "customerType" "CustomerType",
ADD COLUMN     "discount" DECIMAL(14,0) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "quoteId" TEXT,
ADD COLUMN     "vehicleInfo" TEXT,
ADD COLUMN     "warrantyTermsSnapshot" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "axle" "InstallAxle",
ADD COLUMN     "oeNumber" TEXT,
ADD COLUMN     "partNumber" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "side" "InstallSide",
ADD COLUMN     "vehicleInfo" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerPaymentId" TEXT,
ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "quoteId" TEXT,
ALTER COLUMN "orderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "zalo" TEXT,
    "city" TEXT,
    "address" TEXT,
    "vehicleBrand" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" TEXT,
    "vehicleCode" TEXT,
    "subtotal" DECIMAL(14,0) NOT NULL,
    "shippingFee" DECIMAL(14,0) NOT NULL DEFAULT 0,
    "discount" DECIMAL(14,0) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,0) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "warrantyTermsSnapshot" TEXT NOT NULL,
    "customerNote" TEXT,
    "internalNote" TEXT,
    "codEligible" BOOLEAN NOT NULL DEFAULT false,
    "onlinePaymentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "revisionOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "oeNumber" TEXT,
    "vehicleInfo" TEXT,
    "axle" "InstallAxle",
    "side" "InstallSide",
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,0) NOT NULL,
    "lineTotal" DECIMAL(14,0) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTask" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_publicToken_key" ON "Quote"("publicToken");

-- CreateIndex
CREATE INDEX "Quote_status_customerType_createdAt_idx" ON "Quote"("status", "customerType", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTask_orderId_key" ON "InventoryTask"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_quoteId_key" ON "Payment"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_publicToken_key" ON "Payment"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTask" ADD CONSTRAINT "InventoryTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
