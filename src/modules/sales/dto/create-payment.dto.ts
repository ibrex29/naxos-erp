import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PaymentType, Currency } from "@prisma/client";

export class CreateDocumentDto {
  @ApiProperty({ example: "https://bucket.s3.amazonaws.com/receipt.pdf" })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: "receipt.pdf" })
  @IsOptional()
  @IsString()
  fileName?: string;

  // @ApiProperty({ example: "application/pdf" })
  // @IsOptional()
  // @IsString()
  // mimeType?: string;

  // @ApiProperty({ example: 204800, description: "File size in bytes" })
  // @IsOptional()
  // @IsNumber()
  // size?: number;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 10000, description: "Payment amount" })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: Currency.NGN, enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    example: "CASH",
    enum: PaymentType,
    description: "Payment type (cash, transfer, card, credit, etc.)",
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    example: "uuid-of-sales-order",
    description: "If payment is for a sales order",
  })
  @IsNotEmpty()
  @IsUUID()
  salesOrderId: string;

  @ApiProperty({
    type: [CreateDocumentDto],
    required: false,
    description: "Optional supporting documents for the payment",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentDto)
  documents?: CreateDocumentDto[];
}
