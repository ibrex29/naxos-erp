import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
} from "@nestjs/common";
import { ShipmentService } from "../services/shipment.service";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import { CreateShipmentDto } from "../dto/shipment/create-shipment.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FetchShipmentDTO } from "../dto/shipment/fetch-shipment.dto";
import { Public } from "@/common/constants/routes.constant";
import { UpdateDeliveryStatusDTO } from "../dto/shipment/update-delivery.dto";

@ApiTags("Shipments")
@ApiBearerAuth()
@Controller({path:"shipments", version: "1"})
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new shipment" })
  create(@Body() dto: CreateShipmentDto, @User("userId") userId: string) {
    return this.shipmentService.create(dto, userId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get paginated shipments" })
  @ApiResponse({
    status: 200,
    description: "List of shipments with pagination and relations",
  })
  async getPaginated(@Query() query: FetchShipmentDTO) {
    return this.shipmentService.getPaginatedShipments(query);
  }

    @Get(':id')
  async getShipmentById(@Param('id') id: string) {
    const shipment = await this.shipmentService.getShipmentById(id);
    if (!shipment) {
      return {
        success: false,
        message: `Shipment with ID ${id} not found`,
      };
    }
    return {
      success: true,
      message: 'Shipment fetched successfully',
      data: shipment,
    };
  }

  @Patch(":id/delivery-status")
  @ApiOperation({ summary: "Update the delivery status of a shipment" })
  async updateDeliveryStatus(
    @Param("id") id: string,
    @Body() dto: UpdateDeliveryStatusDTO,
  ) {
    return this.shipmentService.updateDeliveryStatus(id, dto);
  }
}
