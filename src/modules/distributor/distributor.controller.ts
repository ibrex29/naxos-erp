import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Version,
} from "@nestjs/common";
import { DistributorService } from "./distributor.service";
import {
  CreateDistributorDto,
  UpdateDistributorDto,
} from "./dto/create-distributor.dto";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FetchDistributorDTO } from "./dto/fetch-distributors.dto";
import { Public } from "@/common/constants/routes.constant";

@Public()
@ApiTags("Distributors")
@ApiBearerAuth()
@Controller({ path: "distributors", version: "1" })
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Post()
  @ApiOperation({ summary: "Create a new distributor" })
  @ApiResponse({
    status: 201,
    description: "Distributor created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async create(
    @Body() dto: CreateDistributorDto,
    @User("userId") userId: string,
  ) {
    return this.distributorService.create(dto, userId);
  }

  @Get("analytics")
  @ApiOperation({
    summary: "Get distributor analytics",
    description:
      "Returns analytics summary of distributors, including totals, active count, total sales, and breakdown by type (Hospital, Pharmacy, Clinic).",
  })
  @ApiResponse({ status: 200, description: "Analytics fetched successfully" })
  async getAnalytics() {
    return this.distributorService.getDistributorAnalytics();
  }

  @Get()
  @ApiOperation({
    summary: "Get all distributors (paginated)",
    description:
      "Returns a paginated list of distributors with related user details, sales orders, and payments. Includes computed fields like total purchases and last order date.",
  })
  @ApiResponse({ status: 200, description: "Distributors fetched successfully" })
  async getAllDistributors(@Query() query: FetchDistributorDTO) {
    return this.distributorService.getPaginatedDistributors(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a distributor by ID",
    description:
      "Fetch a single distributor with related sales orders, payments, and computed totals.",
  })
  @ApiResponse({ status: 200, description: "Distributor fetched successfully" })
  @ApiResponse({ status: 404, description: "Distributor not found" })
  async getDistributorById(@Param("id") id: string) {
    return this.distributorService.getDistributorById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a distributor" })
  @ApiResponse({
    status: 200,
    description: "Distributor updated successfully",
  })
  @ApiResponse({ status: 404, description: "Distributor not found" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateDistributorDto,
    @User("userId") userId: string,
  ) {
    return this.distributorService.update(id, dto, userId);
  }

//   @Delete(":id")
//   @ApiOperation({ summary: "Delete a distributor" })
//   @ApiResponse({ status: 200, description: "Distributor deleted successfully" })
//   @ApiResponse({ status: 404, description: "Distributor not found" })
//   async remove(@Param("id") id: string) {
//     return this.distributorService.remove(id);
//   }
}
