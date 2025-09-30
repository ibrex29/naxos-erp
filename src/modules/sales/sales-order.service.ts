import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { FetchSalesOrderDTO } from "./dto/fetch-sales-order.dto";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PaymentStatus, Prisma } from "@prisma/client";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class SalesOrderService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateOrderAmount(
    items: { quantity: number; unitPrice: number }[]
  ) {
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }

  // 🔍 1. Validate distributor
  private async validateDistributor(
    tx: Prisma.TransactionClient,
    distributorId: string
  ) {
    const distributor = await tx.distributor.findUnique({
      where: { id: distributorId },
    });
    if (!distributor) throw new Error("Distributor not found");
    return distributor;
  }

  private async createOrder(
    tx: Prisma.TransactionClient,
    dto: CreateSalesOrderDto,
    userId: string,
    items: any[]
  ) {
    const orderAmount = this.calculateOrderAmount(items);

    return tx.salesOrder.create({
      data: {
        distributorId: dto.distributorId,
        salesRepId: userId,
        currency: dto.currency,
        orderAmount,
        amountRemaining:orderAmount,
        paymentStatus: dto.paymentStatus,
        items: { create: items },
      },
      include: {
        distributor: true,
        salesRep: { select: { id: true, email: true } },
        items: { include: { medicine: true } },
      },
    });
  }

  // 📦 Deduct stock from shipment items FIFO
  private async deductStock(
    tx: Prisma.TransactionClient,
    medicineId: string,
    requestedQty: number
  ) {
    const shipments = await tx.shipmentItem.findMany({
      where: { medicineId, quantity: { gt: 0 } },
      orderBy: { createdAt: "asc" }, // FIFO: earliest stock first
    });

    let remaining = requestedQty;
    const salesItems = [];

    for (const shipment of shipments) {
      if (remaining <= 0) break;

      const deductQty = Math.min(shipment.quantity, remaining);

      // Reduce stock in shipment item
      await tx.shipmentItem.update({
        where: { id: shipment.id },
        data: { quantity: { decrement: deductQty } },
      });

      // Push to sales items (use unitCost from shipment batch)
      salesItems.push({
        medicineId,
        quantity: deductQty,
        unitPrice: shipment.unitCost,
      });

      remaining -= deductQty;
    }

    if (remaining > 0) {
      throw new ConflictException({
        medicineId,
        shortage: remaining,
        message: `Not enough stock for this medicine`,
      });
    }

    return salesItems;
  }

  // 🚀 3. Main create method
  async create(dto: CreateSalesOrderDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Validate distributor
      await this.validateDistributor(tx, dto.distributorId);

      // Deduct stock FIFO and collect sales items
      let allSalesItems = [];
      for (const item of dto.items) {
        const deducted = await this.deductStock(
          tx,
          item.medicineId,
          item.quantity
        );
        allSalesItems = [...allSalesItems, ...deducted];
      }

      const order = await this.createOrder(tx, dto, userId, allSalesItems);
      return order;
    });
  }

  async getPaginatedOrders(query: FetchSalesOrderDTO) {
    const { search, sortField, sortOrder, paymentStatus } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { distributor: { name: { contains: search, mode: "insensitive" } } },
        { salesRep: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const orderBy = sortField
      ? { [sortField]: sortOrder || "desc" }
      : { createdAt: "desc" };

    return this.prisma.paginate("SalesOrder", {
      where,
      query,
      orderBy,
      include: {
        distributor: true,
        salesRep: { select: { id: true, email: true } },
        items: { include: { medicine: true } },
        payments: true,
      },
    });
  }

  async createPayment(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id: dto.salesOrderId },
      });

      if (!order) {
        throw new NotFoundException("Sales order not found");
      }

      // ❌ Prevent payment if already fully paid
      if (order.paymentStatus === "PAID") {
        throw new BadRequestException(
          `Payment cannot be made. Sales order ${order.id} is already fully paid.`
        );
      }

      const orderTotal = order.orderAmount ?? 0;
      const newPaidAmount = (order.amountPaid ?? 0) + dto.amount;
      const newRemainingAmount = orderTotal - newPaidAmount;

      // ❌ Prevent overpayment``
      if (newPaidAmount > orderTotal) {
        throw new BadRequestException(
          `Payment exceeds order total. Outstanding balance: ${
            orderTotal - (order.amountPaid ?? 0)
          }`
        );
      }

      // ✅ Create payment linked to sales order + distributor
      const payment = await tx.payment.create({
        data: {
          amount: dto.amount,
          currency: dto.currency,
          type: dto.type,
          entityType: "SalesOrder",
          entityId: dto.salesOrderId,
          salesOrderId: dto.salesOrderId,
          distributorId: order.distributorId,
        },
      });

      // 🔄 Update sales order fields
      let status: PaymentStatus = "PENDING";
      if (newPaidAmount >= orderTotal) status = "PAID";
      else if (newPaidAmount > 0) status = "PARTIAL";

      await tx.salesOrder.update({
        where: { id: dto.salesOrderId },
        data: {
          amountPaid: newPaidAmount,
          amountRemaining: newRemainingAmount,
          paymentStatus: status,
        },
      });

      return payment;
    });
  }
}
