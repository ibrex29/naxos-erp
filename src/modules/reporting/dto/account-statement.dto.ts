import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AccountStatementDto {
  @ApiProperty({
    description: "ID of the distributor/customer",
    example: "c9b1f9d2-8e5a-4aef-9c3d-123456789abc",
  })
  @IsString()
  distributorId: string;

  @ApiPropertyOptional({
    description: "Start date for the statement (ISO format)",
    example: "2025-01-01",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for the statement (ISO format)",
    example: "2025-11-17",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Currency filter: NGN for local, USD for international",
    example: "NGN",
    enum: ["NGN", "USD"],
  })
  @IsString()
  @IsOptional()
  currency?: "NGN" | "USD";
}
