import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Version,
} from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";
import { CreateUserDto, UpdateUserDto } from "./dtos/sign-up.dto";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import { FetchUserDTO } from "./dtos/fetch-user.dto";
@Public()
@ApiTags("User Management")
@ApiBearerAuth()
@Public()
@Controller({ path: "users", version: "1" })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version("1")
  @Post("signup")
  async signup(@Body() signupDto: CreateUserDto) {
    return this.userService.createUser(signupDto);
  }

  @Public()
  @ApiOperation({
    summary: "Get all users (paginated)",
    description:
      "Returns a paginated list of users with optional filters for search, role, and active status.",
  })
  @Get()
  async getAllUsers(
    @Query() query: FetchUserDTO
  ) {
    return this.userService.getPaginatedUsers(query);
  }

  @ApiOperation({ summary: "Update a user" })
  @Put(":id")
  async updateUser(@Param("id") userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto);
  }


  @ApiOperation({ summary: "Get total staff summary by role" })
  @Get("staff-summary")
  async getStaffSummary() {
    return this.userService.getStaffSummary();
  }
}
