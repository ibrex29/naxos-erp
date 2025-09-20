import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  HTTP_MAX_REDIRECTS,
  HTTP_TIMEOUT,
  THROTTLE_LIMIT,
  THROTTLE_TTL,
} from "@/common/constants";
import { ThrottlerModule, seconds } from "@nestjs/throttler";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HttpModule } from "@nestjs/axios";
import { UserModule } from "./modules/user/user.module";
import { UploadModule } from "./common/upload/upload.module";
import { DistributorModule } from "./modules/distributor/distributor.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ["docker.env", ".env"],
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: "19000s" },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: seconds(configService.get(THROTTLE_TTL) || 10),
          limit: configService.get(THROTTLE_LIMIT) || 20,
        },
      ],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get(HTTP_TIMEOUT),
        maxRedirects: configService.get(HTTP_MAX_REDIRECTS),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    UploadModule,
    DistributorModule
  ],
})
export class AppModule {}
