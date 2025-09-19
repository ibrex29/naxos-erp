import { CryptoService } from '@/common/crypto/crypto.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, CryptoService],
  exports: [UserService, CryptoService],
})
export class UserModule {}
