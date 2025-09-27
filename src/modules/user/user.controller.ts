import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Version,
} from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";
import { CreateUserDto, UpdateUserDto } from "./dtos/sign-up.dto";
import { FetchUserDTO } from "./dtos/fetch-user.dto";

@Public()
@ApiTags("User Management")
@ApiBearerAuth()
@Controller({ path: "users", version: "1" })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version("1")
  @ApiOperation({
    summary: "Register a new user",
    description:
      "Creates a new user account with profile information. Email and phone must be unique.",
  })
  @Post("signup")
  async signup(@Body() signupDto: CreateUserDto) {
    return this.userService.createUser(signupDto);
  }

  @ApiOperation({
    summary: "Get all users (paginated)",
    description:
      "Returns a paginated list of users with optional filters for search, role, and active status.",
  })
  @Get()
  async getAllUsers(@Query() query: FetchUserDTO) {
    return this.userService.getPaginatedUsers(query);
  }

  @ApiOperation({
    summary: "Get staff summary",
    description:
      "Returns the total number of staff, broken down by role (administrators, sales, warehouse, finance).",
  })
  @Get("staff-summary")
  async getStaffSummary() {
    return this.userService.getStaffSummary();
  }

  @ApiOperation({
    summary: "Get a user by ID",
    description:
      "Fetch a single user by their unique ID, including profile details.",
  })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
  })
  @Get(":id")
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({
    summary: "Update a user",
    description:
      "Update user details (email, role, profile, active status, etc.).",
  })
  @ApiParam({
    name: "id",
    description: "User ID (UUID) of the user to update",
  })
  @Put(":id")
  async updateUser(@Param("id") userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto);
  }

  @Patch(":id/activate")
  async activateUser(@Param("id") userId: string) {
    return this.userService.activateUser(userId);
  }

  @Patch(":id/deactivate")
  async deactivateUser(@Param("id") userId: string) {
    return this.userService.deactivateUser(userId);
  }

    @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.userService.deleteUser(id);
    return { message: "User deleted successfully" };
  }
}
