import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InventoryService } from "../services/inventory.service";
import { Public } from "@/common/constants/routes.constant";
import { FetchMedicineDTO } from "../dto/inventory/fetch-medicine.dto";

@Public()
@ApiTags("Inventory")
@Controller({path: "inventory", version: "1"})
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("overview")
  getOverview() {
    return this.inventoryService.getOverview();
  }

  @Get("movements/recent")
  getRecentMovements() {
    return this.inventoryService.getRecentMovements();
  }

  @Get("batches/expiring")
  getExpiringBatches() {
    return this.inventoryService.getExpiringBatches();
  }

  @Get("queue/fifo")
  getFIFOQueue() {
    return this.inventoryService.getFIFOQueue();
  }

    @Get()
  @ApiOperation({ summary: "Get paginated medicines" })
  @ApiResponse({
    status: 200,
    description: "List of medicines with pagination and related stock info",
  })
  async getPaginated(@Query() query: FetchMedicineDTO) {
    return this.inventoryService.getPaginatedMedicines(query);
  }
}
