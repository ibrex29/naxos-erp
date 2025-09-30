import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateManufacturerDto } from "./dto/create-manufacturer.dto";
import { UpdateManufacturerDto } from "./dto/update-manufacturer.dto";
import { PrismaService } from "@/common/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { FetchManufacturerDTO } from "./dto/fetch-manufacturer.dto";

@Injectable()
export class ManufacturerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateManufacturerDto, userId: string) {
    // Check if email already exists
    if (dto.email) {
      const existingByEmail = await this.prisma.manufacturer.findUnique({
        where: { email: dto.email },
      });

      if (existingByEmail) {
        throw new ConflictException(
          "Manufacturer with this email already exists"
        );
      }
    }

    // Always generate a new sequential code
    const code = await this.generateCode();

    return this.prisma.manufacturer.create({
      data: {
        ...dto,
        code,
        createdById: userId,
      },
    });
  }
  async getPaginatedManufacturers(query: FetchManufacturerDTO) {
    const { search, sortField, sortOrder, isActive, country } = query;

    const where: Prisma.ManufacturerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (country) {
      where.country = { contains: country, mode: "insensitive" };
    }

    const orderBy: Prisma.ManufacturerOrderByWithRelationInput = sortField
      ? { [sortField]: sortOrder || "desc" }
      : { createdAt: "desc" };

    return this.prisma.paginate("Manufacturer", {
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
        updatedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        medicines: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id },
      include: { medicines: true },
    });
    if (!manufacturer) throw new NotFoundException("Manufacturer not found");
    return manufacturer;
  }

  async update(id: string, dto: UpdateManufacturerDto, userId: string) {
    await this.findOne(id);
    return this.prisma.manufacturer.update({
      where: { id },
      data: {
        ...dto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.manufacturer.delete({ where: { id } });
  }
  /**
   * Private helper to generate sequential manufacturer codes
   */
  private async generateCode(): Promise<string> {
    const lastManufacturer = await this.prisma.manufacturer.findFirst({
      orderBy: { createdAt: "desc" },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastManufacturer?.code) {
      const match = lastManufacturer.code.match(/MFR-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `MFR-${nextNumber.toString().padStart(4, "0")}`;
  }
}
