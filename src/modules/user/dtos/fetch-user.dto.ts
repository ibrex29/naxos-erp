import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { UserType } from "../types";

export enum UserSortFieldEnum {
  firstName = "firstName",
  lastName = "lastName",
  createdAt = "createdAt",
  email = "email",
}

export class FetchUserDTO extends FetchDTO {
  @ApiPropertyOptional({
    example: "createdAt",
    description: "Field to sort by",
    enum: UserSortFieldEnum,
  })
  @IsOptional()
  @IsEnum(UserSortFieldEnum)
  sortField?: UserSortFieldEnum = UserSortFieldEnum.createdAt;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.SUPER_ADMIN,
    description: "Filter by user role",
  })
  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;
}
