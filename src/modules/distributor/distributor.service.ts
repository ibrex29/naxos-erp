// distributor.service.ts
import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributorService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateDistributorDto, userId: string) {
  return this.prisma.distributor.create({
    data: {
      ...dto,
      createdById: userId,
      updatedById: userId,
    },
  });
}


  async findAll() {
    return this.prisma.distributor.findMany();
  }

  async findOne(id: string) {
    const distributor = await this.prisma.distributor.findUnique({ where: { id } });
    if (!distributor) throw new NotFoundException(`Distributor ${id} not found`);
    return distributor;
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


  async remove(id: string) {
    return this.prisma.distributor.delete({ where: { id } });
  }
}
