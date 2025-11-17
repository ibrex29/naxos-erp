// src/reporting/dto/stock-summary.dto.ts
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class StockSummaryDto {
  @ApiPropertyOptional({
    description: "Start date for filtering stock records",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for filtering stock records",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Filter by specific medicine ID",
    example: "med_abc123",
  })
  @IsOptional()
  @IsString()
  medicineId?: string;

  @ApiPropertyOptional({
    description: "Filter by manufacturer ID",
    example: "manu_455dg",
  })
  @IsOptional()
  @IsString()
  manufacturerId?: string;

  @ApiPropertyOptional({
    description: "Filter by shipment mode",
    example: "AIR",
    enum: ["AIR", "SEA", "LAND"],
  })
  @IsOptional()
  @IsString()
  shipmentMode?: "AIR" | "SEA" | "LAND";

//   @ApiPropertyOptional({
//     description: "Export format for the report",
//     example: "excel",
//     enum: ["excel", "pdf", "word"],
//   })
//   @IsOptional()
//   @IsString()
//   @IsIn(["excel", "pdf", "word"])
//   format?: "excel" | "pdf" | "word";
}
