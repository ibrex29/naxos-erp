import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from "@nestjs/common";
import { ManufacturerService } from "./manufacturer.service";
import { CreateManufacturerDto } from "./dto/create-manufacturer.dto";
import { UpdateManufacturerDto } from "./dto/update-manufacturer.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { FetchManufacturerDTO } from "./dto/fetch-manufacturer.dto";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import { SessionUser } from "../auth/types";

@ApiBearerAuth()
@ApiTags("manufacturers")
@Controller({ path: "manufacturers", version: "1" })
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post()
  @ApiOperation({ summary: "Create a new manufacturer" })
  create(@Body() dto: CreateManufacturerDto, @User() user: SessionUser) {
    return this.manufacturerService.create(dto, user.userId);
  }

  @Get("paginated")
  @ApiOperation({ summary: "Get paginated list of manufacturers" })
  async getPaginated(@Query() query: FetchManufacturerDTO) {
    return this.manufacturerService.getPaginatedManufacturers(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get manufacturer by ID" })
  findOne(@Param("id") id: string) {
    return this.manufacturerService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update manufacturer" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateManufacturerDto,
    @User() user: SessionUser
  ) {
    return this.manufacturerService.update(id, dto, user.userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete manufacturer" })
  remove(@Param("id") id: string) {
    return this.manufacturerService.remove(id);
  }
}
