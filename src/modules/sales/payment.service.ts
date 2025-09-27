import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, dto.salesOrderId);

      this.ensureOrderNotPaid(order);

      const { newPaidAmount, newRemainingAmount } = this.calculateAmounts(
        order.orderAmount ?? 0,
        order.amountPaid ?? 0,
        dto.amount,
      );

      this.ensureNotOverpaid(order, newPaidAmount);

      // ✅ Create payment with optional documents
      const payment = await tx.payment.create({
        data: {
          amount: dto.amount,
          currency: dto.currency,
          type: dto.type,
          entityType: "SalesOrder",
          entityId: dto.salesOrderId,
          salesOrderId: dto.salesOrderId,
          distributorId: order.distributorId,
          Document: dto.documents
            ? {
                create: dto.documents.map((doc) => ({
                  url: doc.url,
                //   fileName: doc.url,
                //   mimeType: doc.mimeType,
                //   size: doc.size,
                  uploadedById: userId,
                })),
              }
            : undefined,
        },
        include: { Document: true },
      });

      // 🔄 Update sales order
      await tx.salesOrder.update({
        where: { id: dto.salesOrderId },
        data: {
          amountPaid: newPaidAmount,
          amountRemaining: newRemainingAmount,
          paymentStatus: this.getPaymentStatus(
            order.orderAmount ?? 0,
            newPaidAmount,
          ),
        },
      });

      return payment;
    });
  }

  // 🔒 PRIVATE HELPERS

  private async findOrderOrThrow(tx: any, salesOrderId: string) {
    const order = await tx.salesOrder.findUnique({
      where: { id: salesOrderId },
    });
    if (!order) {
      throw new NotFoundException("Sales order not found");
    }
    return order;
  }

  private ensureOrderNotPaid(order: any) {
    if (order.paymentStatus === "PAID") {
      throw new BadRequestException(
        `Payment cannot be made. Sales order ${order.id} is already fully paid.`,
      );
    }
  }

  private calculateAmounts(
    orderTotal: number,
    currentPaid: number,
    newAmount: number,
  ) {
    const newPaidAmount = currentPaid + newAmount;
    const newRemainingAmount = orderTotal - newPaidAmount;
    return { newPaidAmount, newRemainingAmount };
  }

  private ensureNotOverpaid(order: any, newPaidAmount: number) {
    if (newPaidAmount > (order.orderAmount ?? 0)) {
      throw new BadRequestException(
        `Payment exceeds order total. Outstanding balance: ${
          (order.orderAmount ?? 0) - (order.amountPaid ?? 0)
        }`,
      );
    }
  }

  private getPaymentStatus(
    orderTotal: number,
    newPaidAmount: number,
  ): PaymentStatus {
    if (newPaidAmount >= orderTotal) return PaymentStatus.PAID;
    if (newPaidAmount > 0) return PaymentStatus.PARTIAL;
    return PaymentStatus.PENDING;
  }
}
