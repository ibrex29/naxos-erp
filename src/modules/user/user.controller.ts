import {
  Body,
  Controller,
  Post,
  Version,
} from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/constants/routes.constant";
import { CreateUserDto } from "./dtos/sign-up.dto";

@ApiTags("User Management")
@ApiBearerAuth()
@Public()
@Controller({path: "users", version: "1"})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version("1")
  @Post("signup")
  async signup(@Body() signupDto: CreateUserDto) {
    return this.userService.createUser(signupDto);
  }
}
