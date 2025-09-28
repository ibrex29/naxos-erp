import { Module } from "@nestjs/common";
import { SalesOrderService } from "./sales-order.service";
import { SalesOrderController } from "./sales-order.controller";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  controllers: [SalesOrderController, PaymentController],
  providers: [SalesOrderService,PaymentService ],
})
export class SalesOrderModule {}
