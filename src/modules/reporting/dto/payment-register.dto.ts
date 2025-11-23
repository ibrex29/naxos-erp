import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from "class-validator";
import { PaymentType, Currency } from "@prisma/client";
import { Type } from "class-transformer";

export class PaymentRegisterQueryDto {
  @ApiProperty({
    required: false,
    example: "2025-01-01",
    description: "Start date for filtering payments (YYYY-MM-DD)",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    required: false,
    example: "2025-01-31",
    description: "End date for filtering payments (YYYY-MM-DD)",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    required: false,
    enum: PaymentType,
    example: PaymentType.CASH,
    description: "Filter by payment type",
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiProperty({
    required: false,
    enum: Currency,
    example: Currency.NGN,
    description: "Currency of the payment",
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    required: false,
    example: "d9b019be-5c77-41e0-9cf6-fbcabf729cc1",
    description: "Filter payments by distributor ID",
  })
  @IsOptional()
  @IsString()
  distributorId?: string;

  @ApiProperty({
    required: false,
    example: "7a442d5c-97bd-4f8c-b6bc-2eebd44e3a21",
    description: "Filter payments by sales order ID",
  })
  @IsOptional()
  @IsString()
  salesOrderId?: string;

@ApiProperty({ required: false, default: 1 })
@IsOptional()
@Type(() => Number)
@IsNumber()
page?: number = 1;

@ApiProperty({ required: false, default: 50 })
@IsOptional()
@Type(() => Number)
@IsNumber()
limit?: number = 50;

}
