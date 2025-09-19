import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '@/modules/auth/types';
import { ConfigService } from '@nestjs/config';
import { JWT_ACCESS_SECRET } from '@/common/constants';
import { JwtTokenService } from '@/common/token/jwt-token.service';
import { Request } from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private jwtTokenService: JwtTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(JWT_ACCESS_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isBlacklisted = await this.jwtTokenService.isBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Session expired');
    }

    // return session metadata for currently loggedin user
    return {
      userId: payload.sub,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
    };
  }
}
