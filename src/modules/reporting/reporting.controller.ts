import { Controller, Get, Query } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { AccountStatementDto } from "./dto/account-statement.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";

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
}
