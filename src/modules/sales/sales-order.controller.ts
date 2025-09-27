import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { SalesOrderService } from "./sales-order.service";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { FetchSalesOrderDTO } from "./dto/fetch-sales-order.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { use } from "passport";
import { SessionUser } from "../auth/types";
import { User } from "@/common/decorators/param-decorator/User.decorator";

@ApiTags("Sales Orders")
@ApiBearerAuth()
@Controller("sales-orders")
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post()
  @ApiOperation({ summary: "Create a new sales order" })
  @ApiResponse({ status: 201, description: "Sales order created" })
  async create(@Body() dto: CreateSalesOrderDto
  , @User() user: SessionUser) {
    return this.salesOrderService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: "Get paginated sales orders" })
  @ApiResponse({ status: 200, description: "List of sales orders with pagination" })
  async getPaginated(@Query() query: FetchSalesOrderDTO) {
    return this.salesOrderService.getPaginatedOrders(query);
  }

  
}
