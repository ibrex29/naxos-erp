import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Currency, PaymentStatus } from "@prisma/client";

class SalesOrderItemDto {
  @ApiProperty({ example: "uuid-of-medicine", description: "Medicine ID" })
  @IsNotEmpty()
  @IsString()
  medicineId: string;

  @ApiProperty({ example: 10, description: "Quantity ordered" })
  @IsNumber()
  quantity: number;

}

export class CreateSalesOrderDto {
  @ApiProperty({ example: "uuid-of-distributor", description: "Distributor ID" })
  @IsNotEmpty()
  @IsString()
  distributorId: string;

  @ApiPropertyOptional({ enum: Currency, example: Currency.NGN })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.NGN;

  @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @ApiProperty({ type: [SalesOrderItemDto] })
  @IsArray()
  items: SalesOrderItemDto[];
}
