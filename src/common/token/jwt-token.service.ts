import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  BLACKLISTED_TOKEN,
  JWT_ACCESS_EXPIRY,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRY,
  JWT_REFRESH_SECRET,
  MILLISECONDS_PER_SECOND,
} from '@/common/constants';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/modules/auth/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtTokenService {
  private JWT_ACCESS_SECRET;
  private JWT_ACCESS_EXPIRY;
  private JWT_REFRESH_SECRET;
  private JWT_REFRESH_EXPIRY;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    this.JWT_ACCESS_SECRET = this.configService.getOrThrow(JWT_ACCESS_SECRET);
    this.JWT_ACCESS_EXPIRY = this.configService.getOrThrow(JWT_ACCESS_EXPIRY);
    this.JWT_REFRESH_SECRET = this.configService.getOrThrow(JWT_REFRESH_SECRET);
    this.JWT_REFRESH_EXPIRY = this.configService.getOrThrow(JWT_REFRESH_EXPIRY);
  }

  async generateToken(payload: Partial<any>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessTokenPromise = this.jwtService.signAsync(payload, {
      secret: this.JWT_ACCESS_SECRET,
      expiresIn: this.JWT_ACCESS_EXPIRY,
    });

    const refreshTokenPromise = this.jwtService.signAsync(payload, {
      secret: this.JWT_REFRESH_SECRET,
      expiresIn: this.JWT_REFRESH_EXPIRY,
    });

    return Promise.all([accessTokenPromise, refreshTokenPromise]).then(
      ([accessToken, refreshToken]) => ({ accessToken, refreshToken }),
    );
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.JWT_ACCESS_SECRET,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.JWT_REFRESH_SECRET,
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  private extractExpirationTime(token: string): number | null {
    try {
      const { exp } = this.jwtService.decode(token) as { exp: number };
      return exp; // return jwt exipry in seconds
    } catch (error) {
      return null; // Invalid token or unable to decode
    }
  }

  async blacklist(token: string): Promise<void> {
    const expirationTime = this.extractExpirationTime(token);
    const expirationDate = expirationTime
      ? new Date(expirationTime * MILLISECONDS_PER_SECOND)
      : new Date(Date.now() + ms(this.JWT_ACCESS_EXPIRY));

    await this.prisma.blacklistedToken.create({
      data: {
        token,
        expiresAt: expirationDate,
      },
    });
  }
}
