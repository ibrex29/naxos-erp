import { Module } from "@nestjs/common";
import { ShipmentService } from "./services/shipment.service";
import { ShipmentController } from "./controllers/shipment.controller";
import { InventoryService } from "./services/inventory.service";
import { InventoryController } from "./controllers/inventory.controller";

@Module({
  controllers: [ShipmentController, InventoryController],
  providers: [ShipmentService, InventoryService],
  exports: [ShipmentService], 
})
export class ShipmentModule {}
