import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { DistributorType } from "@prisma/client";
import { IsOptional, IsEnum, IsString } from "class-validator";

export enum DistributorSortFieldEnum {
  name = "name",
  email = "email",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
}

export class FetchDistributorDTO extends FetchDTO {
  @ApiPropertyOptional({
    enum: DistributorSortFieldEnum,
    example: "createdAt",
    description: "Field to sort distributors by",
  })
  @IsOptional()
  @IsEnum(DistributorSortFieldEnum)
  sortField?: DistributorSortFieldEnum = DistributorSortFieldEnum.createdAt;

    @ApiPropertyOptional({
    description: "Filter distributors by type",
    example: DistributorType.PHARMACY,
    enum: DistributorType,
    })
    @IsOptional()
    @IsEnum(DistributorType)
    type?: DistributorType;
}
