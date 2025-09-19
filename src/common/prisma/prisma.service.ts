import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { CryptoService } from '../crypto/crypto.service';
import { FetchDTO, PaginationResultDTO } from '../dto';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly cryptoService: CryptoService) {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    // Global Prisma middleware
    this.$use(async (params, next) => {
      // Auto-hash password on User create
      if (params.model === 'User' && params.action === 'create') {
        const user = params.args.data;
        if (user.password) {
          user.password = await this.cryptoService.hashPassword(user.password);
          params.args.data = user;
        }
      }

      return next(params);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Generic pagination utility for Prisma models
   * @param modelName Prisma model name (e.g., 'user', 'post')
   * @param options Pagination, filtering, ordering options
   */
  async paginate<T>(
    modelName: Prisma.ModelName,
    options: {
      query: FetchDTO & { sortField?: string };
      where?: Prisma.PrismaClientKnownRequestError | Record<string, any>;
      include?: Prisma.PrismaClientKnownRequestError | Record<string, any>;
      orderBy?: Prisma.PrismaClientKnownRequestError | Record<string, any>;
    },
  ): Promise<PaginationResultDTO<T>> {
    const { query, where = {}, include = {}, orderBy } = options;
    const { limit, page } = query;

    const skip = Math.max((page - 1) * limit, 0);

    const [count, rows] = await Promise.all([
      this[modelName].count({ where }),
      this[modelName].findMany({
        skip,
        take: limit,
        where,
        include,
        orderBy: orderBy ?? { createdAt: 'desc' }, // sensible default
      }),
    ]);

    return new PaginationResultDTO<T>(rows, count, query);
  }
}
