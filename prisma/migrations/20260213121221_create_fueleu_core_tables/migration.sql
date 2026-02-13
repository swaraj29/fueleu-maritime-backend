/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Route` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[routeId,year]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Route_routeId_key";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "createdAt";

-- CreateTable
CREATE TABLE "ShipCompliance" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cbGco2eq" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankEntry" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amountGco2eq" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolMember" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "cbBefore" DOUBLE PRECISION NOT NULL,
    "cbAfter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoolMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipCompliance_shipId_year_key" ON "ShipCompliance"("shipId", "year");

-- CreateIndex
CREATE INDEX "PoolMember_poolId_idx" ON "PoolMember"("poolId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_routeId_year_key" ON "Route"("routeId", "year");

-- AddForeignKey
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
