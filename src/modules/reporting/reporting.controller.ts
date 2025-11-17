import { Controller, Get, Query } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { AccountStatementDto } from "./dto/account-statement.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";
import { StockSummaryDto } from "./dto/stock-summary.dto";

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
}
