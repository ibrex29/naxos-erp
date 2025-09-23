-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "status" "StockMovementType" NOT NULL DEFAULT 'IN';
