import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "@/modules/auth/auth.service";
import { LocalAuthGuard } from "@/modules/auth/guard/local-auth.guard";
import { Public } from "@/common/constants/routes.constant";
import { PasswordService } from "../password.service";
import { RequestPasswordResetDto } from "../dtos/request-reset-password.dto";
import { PasswordResetDto } from "../dtos/reset-password.dto";
import { ValidatePasswordResetDto } from "../dtos/validate-reset-password.dto";
import { EmailLoginDto } from "../dtos/email-login.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ChangePasswordDTO } from "../dtos/change-password.dto";
import { User } from "@/common/decorators/param-decorator/User.decorator";
import { SessionUser } from "../types";
import { PhoneLoginDto } from "../dtos/phone-login.dto";
import { PhoneLocalAuthGuard } from "../guard/phone-local-auth.guard";

@ApiTags("Authentication")
@ApiBearerAuth()
@Controller({
  version: "1",
  path: "auth",
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService
  ) {}

  @Public()
  @Post("login")
  @UseGuards(LocalAuthGuard)
  async emailLogin(@Request() req, @Body() emailLogin: EmailLoginDto) {
    return this.authService.login(req.user);
  }

  @Get("session")
  getSession(@User() user: SessionUser) {
    return user;
  }

  @Post("refresh-token")
  refresh(@Request() req) {
    return true;
  }

  @Post("logout")
  async logout(@Headers("authorization") authorizationHeader: string) {
    const accessToken = authorizationHeader.split(" ")[1];

    await this.authService.logout(accessToken);

    return { message: "Logged out successfully" };
  }

  @Public()
  @Post("password/request-reset/")
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto
  ) {
    await this.passwordService.requestPasswordReset(
      requestPasswordResetDto.email
    );
    return `Password reset requested successfully`;
  }

  @Public()
  @Patch("password/reset")
  async resetPassword(@Body() passwordResetDto: PasswordResetDto) {
    await this.passwordService.resetPasswordWithToken(
      passwordResetDto.email,
      passwordResetDto.resetToken,
      passwordResetDto.newPassword
    );
  }

  @Public()
  @Post("password/validate-token")
  async validatePasswordResetToken(
    @Body() validatePasswordResetDto: ValidatePasswordResetDto
  ) {
    return this.authService.validatePasswordResetToken(
      validatePasswordResetDto
    );
  }

  @Post("password/change")
  @ApiOperation({ summary: "Change password" })
  @ApiResponse({
    status: 201,
    description: "Password changed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid password",
  })
  async changePassword(
    @User() user: SessionUser,
    @Body() changePasswordDTO: ChangePasswordDTO
  ): Promise<any> {
    return this.authService.changePassword(changePasswordDTO, user);
  }
}
