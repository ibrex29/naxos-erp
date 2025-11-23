import { Controller, Get, Query } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { AccountStatementDto } from "./dto/account-statement.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";
import { StockSummaryDto } from "./dto/stock-summary.dto";
import { PaymentRegisterQueryDto } from "./dto/payment-register.dto";

@Public()
@ApiBearerAuth()
@ApiTags("Reporting Module")
@Controller("reporting")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("customer-account-statement")
  async getAccountStatement(@Query() dto: AccountStatementDto) {
    return this.reportingService.getCustomerAccountStatement(dto);
  }

  @Get("stock-summary")
async getStockSummary(@Query() dto: StockSummaryDto) {
  return this.reportingService.getStockSummary(dto);
}

@Get("payment-register")
  async paymentRegister(@Query() query: PaymentRegisterQueryDto) {
    return this.reportingService.paymentRegister(query);
  }
}
