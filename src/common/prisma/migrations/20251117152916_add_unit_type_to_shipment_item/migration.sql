-- CreateEnum
CREATE TYPE "ShipmentUnitType" AS ENUM ('SINGLE_PACK', 'BOX', 'CARTON');

-- AlterTable
ALTER TABLE "ShipmentItem" ADD COLUMN     "unitType" "ShipmentUnitType" NOT NULL DEFAULT 'SINGLE_PACK';
