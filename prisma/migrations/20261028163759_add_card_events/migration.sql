-- CreateEnum
CREATE TYPE "CardEventType" AS ENUM ('VISIT', 'QR_VISIT', 'SHARE');

-- CreateTable
CREATE TABLE "CardEvent" (
    "id" TEXT NOT NULL,
    "type" "CardEventType" NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "CardEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardEvent_sellerId_type_createdAt_idx" ON "CardEvent"("sellerId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "CardEvent_sellerId_visitorId_idx" ON "CardEvent"("sellerId", "visitorId");

-- AddForeignKey
ALTER TABLE "CardEvent" ADD CONSTRAINT "CardEvent_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
