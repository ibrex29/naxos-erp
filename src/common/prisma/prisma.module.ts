import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CryptoService } from '@/common/crypto/crypto.service';

@Global()
@Module({
  providers: [PrismaService, CryptoService],
  exports: [PrismaService],
})
export class PrismaModule {}
