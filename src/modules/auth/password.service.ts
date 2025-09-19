import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CryptoService } from '@/common/crypto/crypto.service';
import { InvalidResetTokenException } from '@/modules/auth/exceptions/InvalidResetToken.exception';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SITE_URL } from '@/common/constants';
import { UserService } from '../user/user.service';
import { UserNotFoundException } from '../user/exceptions/UserNotFound.exception';

@Injectable()
export class PasswordService {
  private readonly siteUrl;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private userService: UserService,
    private cryptoService: CryptoService,
    private prisma: PrismaService,
  ) // private mailService: MailService,
  {
    this.siteUrl = this.configService.get(SITE_URL);
  }

  async isResetTokenValid(passwordResetToken: string): Promise<boolean> {
    const isValidToken = await this.validateResetToken(passwordResetToken);
    return !!isValidToken;
  }

  async resetPassword(email: string, newPassword: string) {
    await this.userService.validateUserExists(email);
    return this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });
  }

  async changePassword(userId: string, newPassword: string) {
    await this.userService.validateUserExists(userId);
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const passwordResetToken = await this.generateSecureToken();
    await this.saveResetToken(user.email, passwordResetToken);

    const resetUrl = `${this.configService.getOrThrow(
      'FRONTEND_URL',
    )}/reset-password?token=${passwordResetToken}`;

    // await this.mailService.sendTemplateEmail(
    //   EmailTemplates.PASSWORD_RESET,
    //   user.email,
    //   user.firstName,
    //   { reset_url: resetUrl, user: user.firstName }
    // );

    return passwordResetToken;
  }

  async resetPasswordWithToken(
    email: string,
    passwordResetToken: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const isValidToken = await this.validateResetToken(passwordResetToken);

    if (!isValidToken) {
      throw new InvalidResetTokenException();
    }

    await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });

    await this.invalidateResetToken(email);
  }

  private async saveResetToken(
    email: string,
    passwordResetToken: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 hours from now
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token: passwordResetToken,
        expiresAt,
      },
    });
    Logger.log(
      passwordResetToken,
      `saveResetToken - passwordResetToken:${email}`,
    );
  }

  private async validateResetToken(
    passwordResetToken: string,
  ): Promise<boolean> {
    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: passwordResetToken,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      return false;
    }

    Logger.log(
      `Valid token for email: ${tokenRecord.email}`,
      `validateResetToken`,
    );
    return true;
  }

  private async invalidateResetToken(email: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: { email },
    });
  }

  private sendResetTokenToUser(user: any, passwordResetToken: string): void {
    return null;
  }

  private async generateSecureToken(): Promise<string> {
    const randomBytes = await this.cryptoService.getRandomBytes(32); // 32 bytes for a secure token
    return randomBytes.toString('hex');
  }
}
