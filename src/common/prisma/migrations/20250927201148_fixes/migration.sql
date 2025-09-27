-- CreateEnum
CREATE TYPE "ShipmentMode" AS ENUM ('AIR', 'SEA', 'LAND');

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "manufacturingDate" TIMESTAMP(3),
ADD COLUMN     "packSize" TEXT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "shipmentMode" "ShipmentMode";
