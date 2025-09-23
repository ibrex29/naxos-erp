/*
  Warnings:

  - You are about to drop the column `shipmentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `SalesItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `SalesItem` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `SalesItem` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNo` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the `Batch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BatchToShipment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `medicineId` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billOfLading` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proformaInvoiceNo` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_productId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "SalesItem" DROP CONSTRAINT "SalesItem_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_batchId_fkey";

-- DropForeignKey
ALTER TABLE "_BatchToShipment" DROP CONSTRAINT "_BatchToShipment_A_fkey";

-- DropForeignKey
ALTER TABLE "_BatchToShipment" DROP CONSTRAINT "_BatchToShipment_B_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "shipmentId";

-- AlterTable
ALTER TABLE "SalesItem" DROP COLUMN "batchId",
DROP COLUMN "price",
DROP COLUMN "qty",
ADD COLUMN     "medicineId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "currency",
DROP COLUMN "invoiceNo",
ADD COLUMN     "billOfLading" TEXT NOT NULL,
ADD COLUMN     "documents" JSONB,
ADD COLUMN     "proformaInvoiceNo" TEXT NOT NULL,
ADD COLUMN     "receivedDate" TIMESTAMP(3),
ALTER COLUMN "createdById" DROP NOT NULL;

-- DropTable
DROP TABLE "Batch";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "StockMovement";

-- DropTable
DROP TABLE "_BatchToShipment";

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "manufacturer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
