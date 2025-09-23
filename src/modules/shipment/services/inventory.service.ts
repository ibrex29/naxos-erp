import { PrismaService } from "@/common/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { subDays, addDays } from "date-fns";
import { FetchMedicineDTO } from "../dto/inventory/fetch-medicine.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dashboard Overview
   */
  async getOverview() {
    // Total stock value
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

    // Active items
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

  /**
   * Expiring batches (FEFO)
   */
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

  /**
   * FIFO / FEFO Queue
   */
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

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { strength: { contains: search, mode: "insensitive" } },
      { form: { contains: search, mode: "insensitive" } },
      { manufacturer: { contains: search, mode: "insensitive" } },
    ];
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
