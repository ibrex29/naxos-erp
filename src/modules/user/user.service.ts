import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { UserNotFoundException } from "@/modules/user/exceptions/UserNotFound.exception";
import { CreateUserDto } from "./dtos/sign-up.dto";
import { extractNames } from "./utils/parse-name.util";

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
