import {
  Controller,
  Post,
  Body,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { SalesOrderService } from "./sales-order.service";
import { SessionUser } from "../auth/types";
import { PaymentService } from "./payment.service";
import { User } from "@/common/decorators/param-decorator/User.decorator";

@ApiBearerAuth()
@ApiTags("Payments")
@Controller({ path: "payments", version: "1"})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 💰 Create payment
  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  async create(
    @Body() dto: CreatePaymentDto,
    @User() user: SessionUser
) {
    return this.paymentService.createPayment(dto,user.userId);
  }

  // // 📜 Get all payments for a sales order
  // @Get("sales-order/:id")
  // @ApiOperation({ summary: "Get payments for a sales order" })
  // async getBySalesOrder(@Param("id", ParseUUIDPipe) id: string) {
  //   return this.paymentService.getPaymentsBySalesOrder(id);
  // }

  // // 📜 Get all payments for a distributor
  // @Get("distributor/:id")
  // @ApiOperation({ summary: "Get payments for a distributor" })
  // async getByDistributor(@Param("id", ParseUUIDPipe) id: string) {
  //   return this.paymentService.getPaymentsByDistributor(id);
  // }

  // // (Optional) 📜 Get single payment
  // @Get(":id")
  // @ApiOperation({ summary: "Get a single payment by ID" })
  // async getOne(@Param("id", ParseUUIDPipe) id: string) {
  //   return this.paymentService.getPaymentById(id);
  // }
}
