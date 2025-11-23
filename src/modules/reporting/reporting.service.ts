import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatementDto } from "./dto/account-statement.dto";
import { PrismaService } from "@/common/prisma/prisma.service";
import { Transaction } from "./interfaces/transaction.interface";
import { StockSummaryDto } from "./dto/stock-summary.dto";
import { PaymentRegisterQueryDto } from "./dto/payment-register.dto";

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getCustomerAccountStatement(dto: AccountStatementDto) {
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date("2000-01-01");
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    const distributor = await this.prisma.distributor.findUnique({
      where: { id: dto.distributorId },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        email: true,
        phone: true,
        address: true,
        currency: true,
        creditLimit: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!distributor) {
      throw new NotFoundException("Distributor not found");
    }

    const salesOrders = await this.prisma.salesOrder.findMany({
      where: {
        distributorId: dto.distributorId,
        createdAt: { gte: startDate, lte: endDate },
        ...(dto.currency ? { currency: dto.currency } : {}),
      },
      select: {
        id: true,
        createdAt: true,
        orderAmount: true,
        amountPaid: true,
        amountRemaining: true,
        currency: true,
        items: {
          select: {
            id: true,
            medicineId: true,
            quantity: true,
            unitPrice: true,
            medicine: {
              select: {
                id: true,
                name: true,
                strength: true,
                form: true,
                countryOfOrigin: true,
              },
            },
          },
        },
      },
    });

    // 3. Payments with related documents (Document[])
    const payments = await this.prisma.payment.findMany({
      where: {
        distributorId: dto.distributorId,
        createdAt: { gte: startDate, lte: endDate },
        ...(dto.currency ? { currency: dto.currency } : {}),
      },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        currency: true,
        type: true,
        salesOrderId: true,
        Document: {
          select: {
            id: true,
            url: true,
            fileName: true,
            mimeType: true,
            size: true,
          },
        },
      },
    });

    // 4. Build transaction list (map invoices to debit, payments to credit)
    const invoiceTransactions: Transaction[] = salesOrders.map((so) => {
      // compute line totals if not stored
      const lineItems = so.items.map(item => ({
        id: item.id,
        medicineId: item.medicineId,
        medicine: item.medicine,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
      }));

      return {
        type: "Invoice" as const,
        date: so.createdAt,
        reference: so.id,
        debit: so.orderAmount ?? lineItems.reduce((s, it) => s + it.totalPrice, 0),
        credit: 0,
        currency: so.currency,
        details: {
          items: lineItems,
        },
      } as Transaction;
    });

    const paymentTransactions: Transaction[] = payments.map((p) => ({
      type: "Payment" as const,
      date: p.createdAt,
      reference: p.id,
      debit: 0,
      credit: p.amount,
      currency: p.currency,
      details: {
        paymentType: p.type,
        salesOrderId: p.salesOrderId,
        documents: p.Document,
      },
    }));

    const transactions: Transaction[] = [...invoiceTransactions, ...paymentTransactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    // 5. Calculate running balance
    let balance = 0;
    for (const tx of transactions) {
      balance += (tx.debit || 0) - (tx.credit || 0);
      tx.runningBalance = balance;
    }

    // 6. Summary numbers
    const totalInvoicedAmount = salesOrders.reduce((s, so) => s + (so.orderAmount ?? 0), 0);
    const totalPaidAmount = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
    const outstandingBalance = totalInvoicedAmount - totalPaidAmount;

    // 7. Response
    return {
      distributor,
      filters: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currency: dto.currency ?? "ALL",
      },
      summary: {
        totalInvoices: salesOrders.length,
        totalPayments: payments.length,
        totalInvoicedAmount,
        totalPaidAmount,
        outstandingBalance,
      },
      transactions,
    };
  }

async getStockSummary(dto: StockSummaryDto) {
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date("2000-01-01");
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    /**
     * STEP 1: Fetch Received Stock (Shipment → ShipmentItem → Medicine)
     */
    const received = await this.prisma.shipmentItem.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(dto.medicineId ? { medicineId: dto.medicineId } : {}),
        shipment: dto.shipmentMode ? { shipmentMode: dto.shipmentMode } : {},
        medicine: dto.manufacturerId ? { manufacturerId: dto.manufacturerId } : {},
      },
      select: {
        quantity: true,
        unitCost: true,
        unitCostToBeSold: true,
        medicine: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
            packSize: true,
            manufacturingDate: true,
            countryOfOrigin: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
                country: true,
              },
            },
          },
        },
      },
    });

    /**
     * STEP 2: Fetch Sold Stock (SalesOrder → SalesItem → Medicine)
     */
    const sold = await this.prisma.salesItem.findMany({
      where: {
        salesOrder: { createdAt: { gte: startDate, lte: endDate } },
        ...(dto.medicineId ? { medicineId: dto.medicineId } : {}),
        medicine: dto.manufacturerId ? { manufacturerId: dto.manufacturerId } : {},
      },
      select: {
        quantity: true,
        unitPrice: true,
        medicine: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
            packSize: true,
            manufacturingDate: true,
            countryOfOrigin: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
                country: true,
              },
            },
          },
        },
      },
    });

    /**
     * STEP 3: Aggregate per Medicine
     */
    const summary: Record<string, any> = {};

    // Received stock
    for (const r of received) {
      const mId = r.medicine.id;
      if (!summary[mId]) {
        summary[mId] = {
          medicine: r.medicine,
          totalReceived: 0,
          totalSold: 0,
          currentBalance: 0,
          stockValue: 0,
        };
      }
      summary[mId].totalReceived += r.quantity;
      summary[mId].stockValue += (r.unitCostToBeSold ?? r.unitCost ?? 0) * r.quantity;
    }

    // Sold stock
    for (const s of sold) {
      const mId = s.medicine.id;
      if (!summary[mId]) {
        summary[mId] = {
          medicine: s.medicine,
          totalReceived: 0,
          totalSold: 0,
          currentBalance: 0,
          stockValue: 0,
        };
      }
      summary[mId].totalSold += s.quantity;
    }

    // Calculate final balance
    Object.values(summary).forEach((item: any) => {
      item.currentBalance = item.totalReceived - item.totalSold;
    });

    return {
      filters: dto,
      generatedAt: new Date(),
      totalMedicines: Object.keys(summary).length,
      items: Object.values(summary),
    };
  }

   async paymentRegister(query: PaymentRegisterQueryDto) {
    const { fromDate, toDate, paymentType, currency, distributorId, salesOrderId, page, limit } = query;

    const filters: any = {};

    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.gte = new Date(fromDate);
      if (toDate) filters.createdAt.lte = new Date(toDate + "T23:59:59Z");
    }

    if (paymentType) filters.type = paymentType;
    if (currency) filters.currency = currency;
    if (distributorId) filters.distributorId = distributorId;
    if (salesOrderId) filters.salesOrderId = salesOrderId;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: filters,
        include: {
          distributor: true,
          salesOrder: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: filters }),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items: items.map((p) => ({
        id: p.id,
        date: p.createdAt,
        amount: p.amount,
        type: p.type,
        currency: p.currency,
        distributorName: p.distributor?.name ?? null,
        salesOrderId: p.salesOrderId,
        entityType: p.entityType,
        entityId: p.entityId,
      })),
    };
  }
}