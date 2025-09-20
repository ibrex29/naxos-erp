import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { DistributorService } from "./distributor.service";
import { CreateDistributorDto } from "./dto/create-distributor.dto";
import { UpdateDistributorDto } from "./dto/update-distributor.dto";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Distributors")
@ApiBearerAuth()
@Controller("distributors")
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Post()
  @ApiOperation({ summary: "Create a new distributor" })
  @ApiResponse({
    status: 201,
    description: "Distributor created successfully",
    type: CreateDistributorDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  create(@Body() dto: CreateDistributorDto, @User("userId") userId: string) {
    return this.distributorService.create(dto, userId);
  }
  @Get()
  findAll() {
    return this.distributorService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.distributorService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDistributorDto,
    @User("userId") userId: string
  ) {
    return this.distributorService.update(id, dto, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.distributorService.remove(id);
  }
}
