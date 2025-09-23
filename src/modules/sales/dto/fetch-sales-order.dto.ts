import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentStatus } from "@prisma/client";

export enum SalesOrderSortFieldEnum {
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  paymentStatus = "paymentStatus",
}

export class FetchSalesOrderDTO extends FetchDTO {
  @ApiPropertyOptional({ description: "Search by distributor or sales rep" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SalesOrderSortFieldEnum, example: "createdAt" })
  @IsOptional()
  @IsEnum(SalesOrderSortFieldEnum)
  sortField?: SalesOrderSortFieldEnum = SalesOrderSortFieldEnum.createdAt;

  @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
