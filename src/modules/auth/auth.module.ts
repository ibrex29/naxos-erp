import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenStrategy } from '@/modules/auth/strategy/access-token.strategy';
import { ApiKeyStrategy } from '@/modules/auth/strategy/apikey.strategy';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtTokenService } from '@/common/token/jwt-token.service';
import { LocalStrategy } from '@/modules/auth/strategy/local.strategy';
import { LoginValidationMiddleware } from '@/common/middlewares/login-validation.middleware';
import { PassportModule } from '@nestjs/passport';
import { PasswordService } from './password.service';
import { RefreshTokenStrategy } from '@/modules/auth/strategy/refresh-token.strategy';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserModule } from '../user/user.module';
import { PhoneLocalStrategy } from './strategy/phone-local.strategy';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    ApiKeyStrategy,
    LocalStrategy,
    PhoneLocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtTokenService,
    PasswordService,
    {
      provide: APP_GUARD, // set api rate limiting globally (throttling)
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD, // set authentication globally
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes({
      path: 'v1/auth/login',
      method: RequestMethod.POST,
    });
  }
}
