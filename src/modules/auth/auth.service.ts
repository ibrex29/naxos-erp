import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload, SessionUser } from '@/modules/auth/types';
import { JwtTokenService } from '@/common/token/jwt-token.service';
import { CryptoService } from '@/common/crypto/crypto.service';
import { UserService } from '../user/user.service';
import { ValidatePasswordResetDto } from './dtos/validate-reset-password.dto';
import { PasswordService } from './password.service';
import { ChangePasswordDTO } from './dtos/change-password.dto';

@Injectable()
export class AuthService {


  constructor(
    private userService: UserService,
    private jwtTokenService: JwtTokenService,
    private cryptoService: CryptoService,
    private passwordService: PasswordService,
  ) {}

  validateApiKey(apiKey: string) {
    const apiKeys: string[] = ['api-key-1', 'api-key-2'];
    return apiKeys.find((key) => apiKey === key);
  }

  async validateByMatricNumber(matricNumber: string, password: string): Promise<any> {
    const user = await this.userService.findUserByMatricNumber(matricNumber);
    if (!user) return null;

    const isMatch = await this.cryptoService.comparePassword(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...result } = user;
    return result;
  }

  //   async validateByLga(lga: string, password: string): Promise<any> {
  //   const user = await this.userService.findUserByLga(lga);
  //   if (!user) return null;

  //   const isMatch = await this.cryptoService.comparePassword(password, user.password);
  //   if (!isMatch) return null;

  //   const { password: _, ...result } = user;
  //   return result;
  // }

async validateUser(identifier: string, inputtedPassword: string) {
  let user = null;

  // Try Email
  if (!user) {
    user = await this.userService.findUserByEmail(identifier);
    if (user) console.log(`[AuthService] Login attempt with EMAIL: ${identifier}`);
  }

  // Try Matric Number
  if (!user) {
    user = await this.userService.findUserByMatricNumber(identifier);
    if (user) console.log(`[AuthService] Login attempt with MATRIC: ${identifier}`);
  }

  // // Optional: Try LGA
  // if (!user) {
  //   user = await this.userService.findUserByLga(identifier);
  //   if (user) console.log(`[AuthService] Login attempt with LGA: ${identifier}`);
  // }

  if (!user) {
    console.warn(`[AuthService] No user found for identifier: ${identifier}`);
    return null;
  }

  const isMatch = await this.cryptoService.comparePassword(
    inputtedPassword,
    user.password,
  );

  if (!isMatch) {
    console.warn(`[AuthService] Invalid password for user: ${identifier}`);
    return null;
  }

  console.log(`[AuthService] Successful login for userId=${user.id}`);

  const { password, ...result } = user;
  return result;
}


async login(user: any) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    phoneNumber: user.profile?.phone ?? null,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    otherNames: user.profile?.otherNames ?? null,
  };

  const tokens = await this.jwtTokenService.generateToken(payload);

  return {
    ...tokens,
    profile: {
      id: user.id,
      email: user.email,
      role: user.role,
      phoneNumber: user.profile?.phone,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      otherNames: user.profile?.otherNames,
    },
  };
}


  async logout(token: string) {
    return this.jwtTokenService.blacklist(token);
  }

  async validatePasswordResetToken(data: ValidatePasswordResetDto) {
    const isTokenValid = await this.passwordService.isResetTokenValid(
      data.resetToken,
    );

    if (!isTokenValid) {
      throw new BadRequestException({
        status: 'error',
        message: 'Reset token is invalid.',
      });
    }

    return { status: 'success', message: 'Reset token is valid.' };
  }

  async changePassword(data: ChangePasswordDTO, user: SessionUser) {
    const passwordValid = await this.validateUser(user.email, data.oldPassword);

    if (!passwordValid) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid Password',
      });
    }

    await this.passwordService.changePassword(user.userId, data.newPassword);

    return {
      status: 'success',
      message: 'Password changed successfully',
    };
  }
}
