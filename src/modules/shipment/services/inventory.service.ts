import { PrismaService } from "@/common/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { subDays, addDays } from "date-fns";
import { FetchMedicineDTO } from "../dto/inventory/fetch-medicine.dto";
import { DeliveryStatusEnum } from "../enum/shipment.enum";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const totalStockValue = await this.prisma.shipmentItem.aggregate({
      _sum: {
        unitCost: true,
        quantity: true,
      },
    });

    const stockValue =
      (totalStockValue._sum.unitCost || 0) *
      (totalStockValue._sum.quantity || 0);

    // Expiring soon (90 days)
    const expiringSoon = await this.prisma.shipmentItem.count({
      where: {
        expiryDate: {
          lte: addDays(new Date(), 90),
        },
      },
    });
    const activeItems = await this.prisma.medicine.count();

    return {
      totalStockValue: stockValue,
      lowStockItems: 0,
      expiringSoon,
      activeItems,
    };
  }

  /**
   * Recent Stock Movements
   */
  async getRecentMovements() {
    const movements = await this.prisma.shipmentItem.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { medicine: true },
    });

    return movements.map((m) => ({
      medicine: m.medicine.name,
      batchNumber: m.batchNumber,
      quantity: m.quantity,
      expiryDate: m.expiryDate,
      createdAt: m.createdAt,
    }));
  }

  async getExpiringBatches() {
    return this.prisma.shipmentItem.findMany({
      where: {
        expiryDate: {
          lte: addDays(new Date(), 90),
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
      include: {
        medicine: true,
      },
    });
  }

  async getFIFOQueue() {
    return this.prisma.shipmentItem.findMany({
      orderBy: {
        expiryDate: "asc",
      },
      include: {
        medicine: true,
      },
    });
  }

  async getPaginatedMedicines(query: FetchMedicineDTO) {
    const { search, sortField, sortOrder } = query;

    const where: any = {
      shipmentItems: {
        some: {
          quantity: { gt: 0 },
          shipment: {
            deliveryStatus: DeliveryStatusEnum.DELIVERED,
          },
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { strength: { contains: search, mode: "insensitive" } },
        { form: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } },
        {
          shipmentItems: {
            some: {
              batchNumber: { contains: search, mode: "insensitive" },
              shipment: { deliveryStatus: DeliveryStatusEnum.DELIVERED },
            },
          },
        },
      ];
    }

    if (query.form) {
      where.form = { equals: query.form, mode: "insensitive" };
    }

    if (query.expiryBefore) {
      where.shipmentItems.some.expiryDate = {
        lte: new Date(query.expiryBefore),
      };
    }

    if (query.expiryAfter) {
      where.shipmentItems.some.expiryDate = {
        gte: new Date(query.expiryAfter),
      };
    }

    if (query.inStockOnly) {
      where.shipmentItems.some.quantity = { gt: 0 };
    }

    if (query.createdAfter) {
      where.createdAt = { gte: new Date(query.createdAfter) };
    }

    if (query.createdBefore) {
      where.createdAt = { lte: new Date(query.createdBefore) };
    }

    const orderBy = sortField
      ? { [sortField]: sortOrder || "desc" }
      : { createdAt: "desc" };

    return this.prisma.paginate("Medicine", {
      where,
      query,
      orderBy,
      include: {
        shipmentItems: {
          where: {
            quantity: { gt: 0 },
            shipment: { deliveryStatus: DeliveryStatusEnum.DELIVERED },
          },
          select: {
            batchNumber: true,
            expiryDate: true,
            quantity: true,
            unitCost: true,
          },
        },
      },
    });
  }
}
