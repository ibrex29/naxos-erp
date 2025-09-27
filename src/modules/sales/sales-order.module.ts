import { Module } from "@nestjs/common";
import { SalesOrderService } from "./sales-order.service";
import { SalesOrderController } from "./sales-order.controller";
import { PaymentController } from "./payment.controller";

@Module({
  controllers: [SalesOrderController, PaymentController],
  providers: [SalesOrderService, ],
})
export class SalesOrderModule {}
