import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { UserNotFoundException } from "@/modules/user/exceptions/UserNotFound.exception";
import { CreateUserDto, UpdateUserDto } from "./dtos/sign-up.dto";
import { extractNames } from "./utils/parse-name.util";
import { FetchUserDTO } from "./dtos/fetch-user.dto";
import { UserType } from "./types";

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email: ${dto.email} already exists.`
      );
    }

    if (dto.phoneNumber) {
      const existingProfile = await this.prisma.profile.findFirst({
        where: { phone: dto.phoneNumber },
      });

      if (existingProfile) {
        throw new ConflictException(
          `User with phone number: ${dto.phoneNumber} already exists.`
        );
      }
    }

    const { firstName, lastName, middleName } = extractNames(dto.fullname);

    const createdUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        role: dto.role,
        isActive: true,
        profile: {
          create: {
            firstName,
            lastName,
            otherNames: middleName,
            phone: dto.phoneNumber,
          },
        },
      },
    });

    delete createdUser.password;
    return createdUser;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new NotFoundException(`User with ID: ${userId} not found`);
  }

  if (dto.email && dto.email !== user.email) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email: ${dto.email} already exists.`
      );
    }
  }

  if (dto.phoneNumber && dto.phoneNumber !== user.profile?.phone) {
    const existingProfile = await this.prisma.profile.findFirst({
      where: { phone: dto.phoneNumber },
    });
    if (existingProfile) {
      throw new ConflictException(
        `User with phone number: ${dto.phoneNumber} already exists.`
      );
    }
  }

  let firstName = user.profile?.firstName;
  let lastName = user.profile?.lastName;
  let middleName = user.profile?.otherNames;

  if (dto.fullname) {
    const names = extractNames(dto.fullname);
    firstName = names.firstName;
    lastName = names.lastName;
    middleName = names.middleName;
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      email: dto.email ?? user.email,
      role: dto.role ?? user.role,
      profile: {
        update: {
          firstName,
          lastName,
          otherNames: middleName,
          phone: dto.phoneNumber ?? user.profile?.phone,
        },
      },
    },
    include: { profile: true },
  });

  delete updatedUser.password;
  return updatedUser;
}


  async getPaginatedUsers(query: FetchUserDTO) {
  const { search, sortField, sortOrder, isActive, role } = query;

  const where: any = {};

  if (search) {
    where.OR = [
      { profile: { firstName: { contains: search, mode: 'insensitive' } } },
      { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (role) {
    where.role = role;
  }

  const orderBy =
    ['firstName', 'lastName'].includes(sortField || '')
      ? { profile: { [sortField!]: sortOrder || 'asc' } }
      : { [sortField || 'createdAt']: sortOrder || 'desc' };

  const result = await this.prisma.paginate('User', {
    where,
    query,
    orderBy,
    include: {
      profile: true,
    },
  });

  return result;
}

async getUserById(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }

  delete user.password;
  return user;
}


async getStaffSummary() {
  const result = await this.prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  let administrators = 0;
  let salesStaff = 0;
  let warehouseStaff = 0;
  let financeStaff = 0;

  // Map counts from DB result
  result.forEach((r) => {
    switch (r.role) {
      case UserType.SUPER_ADMIN:
        administrators = r._count.role;
        break;
      case UserType.SALES_ADMIN:
        salesStaff = r._count.role;
        break;
      case UserType.WAREHOUSE_ADMIN:
        warehouseStaff = r._count.role;
        break;
      case UserType.FINANCE_ADMIN:
        financeStaff = r._count.role;
        break;
    }
  });

  const total = administrators + salesStaff + warehouseStaff + financeStaff;

  return {
    total,
    administrators,
    salesStaff,
    warehouseStaff,
    financeStaff,
  };
}


  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
        role: true,
        password: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            otherNames: true,
            phone: true,
          },
        },
      },
    });
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findFirst({
      where: {
        profile: {
          phone: phoneNumber,
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteUser(userId: string): Promise<User> {
    await this.validateUserExists(userId);

    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
  }

  async validateUserEmailExists(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new UserNotFoundException();
    }
  }

  async activateUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });
  }



}
