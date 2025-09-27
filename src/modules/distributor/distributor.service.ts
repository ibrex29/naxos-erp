import { PrismaService } from "@/common/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateDistributorDto,
  UpdateDistributorDto,
} from "./dto/create-distributor.dto";
import { FetchDistributorDTO } from "./dto/fetch-distributors.dto";

@Injectable()
export class DistributorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDistributorDto, userId: string) {
    const code = await this.generateDistributorCode("DX");

    return this.prisma.distributor.create({
      data: {
        ...dto,
        code,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async getPaginatedDistributors(query: FetchDistributorDTO) {
    const { search, sortField, sortOrder, type } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const orderBy = sortField
      ? { [sortField]: sortOrder || "desc" }
      : { createdAt: "desc" };

    const result = await this.prisma.paginate("Distributor", {
      where,
      query,
      orderBy,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        salesOrders: {
          include: {
            items: { select: { quantity: true, unitPrice: true } },
          },
        },
        payments: {
          select: { id: true, amount: true, createdAt: true },
        },
      },
    });

    const dataWithComputed = result.data.map((d: any) => {
      const totalPurchases = d.salesOrders.reduce(
        (sum: number, so: any) =>
          sum +
          so.items.reduce(
            (s: number, item: any) => s + item.quantity * item.unitPrice,
            0
          ),
        0
      );

      const sortedOrders = [...d.salesOrders].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestOrder = sortedOrders[0] || null;

      const latestOrderTotal = latestOrder
        ? latestOrder.items.reduce(
            (sum: number, item: any) => sum + item.quantity * item.unitPrice,
            0
          )
        : 0;

      return {
        ...d,
        totalPurchases,
        lastOrder: latestOrder?.createdAt || null,
        latestOrderTotal,
      };
    });

    return { ...result, data: dataWithComputed };
  }

  async getDistributorById(id: string) {
    const distributor = await this.prisma.distributor.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        salesOrders: {
          include: {
            items: { select: { quantity: true, unitPrice: true } },
          },
        },
        payments: {
          select: { id: true, amount: true, createdAt: true },
        },
      },
    });

    if (!distributor) {
      throw new NotFoundException(`Distributor with id ${id} not found`);
    }

    const salesOrdersWithTotal = distributor.salesOrders.map((so) => ({
      ...so,
      totalAmount: so.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    }));

    const totalPurchases = salesOrdersWithTotal.reduce(
      (sum, so) => sum + so.totalAmount,
      0
    );

    const lastOrder = salesOrdersWithTotal.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]?.createdAt;

    return {
      ...distributor,
      salesOrders: salesOrdersWithTotal,
      totalPurchases,
      lastOrder,
    };
  }

  async update(id: string, dto: UpdateDistributorDto, userId: string) {
    return this.prisma.distributor.update({
      where: { id },
      data: {
        ...dto,
        updatedById: userId,
      },
    });
  }

  async getDistributorAnalytics() {
    const distributors = await this.prisma.distributor.findMany({
      select: { id: true, type: true, isActive: true },
    });

    const salesOrders = await this.prisma.salesOrder.findMany({
      include: {
        distributor: { select: { id: true, type: true } },
        items: { select: { quantity: true, unitPrice: true } },
      },
    });

    const totalDistributors = distributors.length;
    const activeDistributors = distributors.filter((d) => d.isActive).length;

    const byType: Record<
      string,
      { total: number; active: number; sales: number }
    > = {};

    for (const d of distributors) {
      if (!byType[d.type]) {
        byType[d.type] = { total: 0, active: 0, sales: 0 };
      }
      byType[d.type].total += 1;
      if (d.isActive) byType[d.type].active += 1;
    }

    for (const so of salesOrders) {
      const orderTotal = so.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      if (so.distributor?.type) {
        byType[so.distributor.type].sales += orderTotal;
      }
    }

    const totalSales = Object.values(byType).reduce(
      (sum, t) => sum + t.sales,
      0
    );

    return {
      totalDistributors,
      activeDistributors,
      totalSales,
      byType,
    };
  }

  async remove(id: string) {
    return this.prisma.distributor.delete({ where: { id } });
  }

  /**
   * Generates sequential distributor codes like DX0001, DX0002, etc.
   */
  private async generateDistributorCode(prefix: string): Promise<string> {
    const lastDistributor = await this.prisma.distributor.findFirst({
      orderBy: { createdAt: "desc" },
      select: { code: true },
    });

    let nextNumber = 1;

    if (lastDistributor?.code) {
      const parts = lastDistributor.code.split("-");
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const numberPart = String(nextNumber).padStart(4, "0");
    return `${prefix}-${numberPart}`;
  }
}
