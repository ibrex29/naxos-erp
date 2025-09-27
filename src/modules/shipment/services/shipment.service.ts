import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateShipmentDto } from "../dto/shipment/create-shipment.dto";
import { UpdateShipmentDto } from "../dto/shipment/update-shipment.dto";
import { FetchShipmentDTO } from "../dto/shipment/fetch-shipment.dto";
import { Prisma } from "@prisma/client";
import { UpdateDeliveryStatusDTO } from "../dto/shipment/update-delivery.dto";

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShipmentDto, userId: string) {
    return this.prisma.shipment.create({
      data: {
        proformaInvoiceNo: dto.proformaInvoiceNo,
        billOfLading: dto.billOfLading,
        supplier: dto.supplier,
        shipmentMode: dto.shipmentMode,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : null,
        documents: dto.documents,
        createdById: userId,
        items: {
          create: dto.items.map((item) => ({
            batchNumber: item.medicine.batchNumber,
            expiryDate: new Date(item.medicine.expiryDate),
            quantity: item.medicine.quantity,
            unitCost: item.medicine.unitCost,          
            medicine: {
              create: {
                name: item.medicine.name,
                form: item.medicine.form,
                manufacturer: item.medicine.manufacturer,
                strength: item.medicine.strength,
                manufacturingDate: item.medicine.manufacturingDate,
                packSize: item.medicine.packSize,
                countryOfOrigin: item.medicine.countryOfManufacture
              },
            },
          })),
        },
      },
      include: {
        items: {
          include: { medicine: true },
        },
      },
    });
  }

  async getPaginatedShipments(query: FetchShipmentDTO) {
    const { search, sortField, sortOrder, status, deliveryStatus } = query;

    const where: Prisma.ShipmentWhereInput = {};

    if (search) {
      where.OR = [
        { proformaInvoiceNo: { contains: search, mode: "insensitive" } },
        { billOfLading: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (deliveryStatus) {
      where.deliveryStatus = deliveryStatus;
    }

    const orderBy: Prisma.ShipmentOrderByWithRelationInput = sortField
      ? { [sortField]: sortOrder || "desc" }
      : { createdAt: "desc" };

    return this.prisma.paginate("Shipment", {
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
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });
  }

  async updateDeliveryStatus(id: string, dto: UpdateDeliveryStatusDTO) {
  return this.prisma.shipment.update({
    where: { id },
    data: {
      deliveryStatus: dto.deliveryStatus,
    },
    include: {
      items: { include: { medicine: true } },
      createdBy: {
        select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } },
      },
    },
  });
}

}
