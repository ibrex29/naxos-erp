import { PrismaClient } from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

export type PrismaRepositoryClient =
  | PrismaService
  | Omit<
      PrismaClient<PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
