import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { MedicineFormEnum } from "../../enum/shipment.enu";

export enum MedicineSortFieldEnum {
  name = "name",
  strength = "strength",
  form = "form",
  manufacturer = "manufacturer",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
}

export class FetchMedicineDTO extends FetchDTO {
  @ApiPropertyOptional({
    description: "Search by name, strength, form, or manufacturer",
    example: "Paracetamol",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: MedicineSortFieldEnum,
    example: "createdAt",
    description: "Field to sort medicines by",
  })
  @IsOptional()
  @IsEnum(MedicineSortFieldEnum)
  sortField?: MedicineSortFieldEnum = MedicineSortFieldEnum.createdAt;

  @ApiPropertyOptional({
    enum: MedicineFormEnum,
    description: "Filter by medicine form",
    example: MedicineFormEnum.TABLET,
  })
  @IsOptional()
  @IsEnum(MedicineFormEnum)
  form?: MedicineFormEnum;

  @ApiPropertyOptional({
    description: "Minimum unit price (from shipment items)",
    example: 10.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    description: "Maximum unit price (from shipment items)",
    example: 100.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Show only medicines that are in stock (quantity > 0)",
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({
    description:
      "Filter medicines with expiry date before this date (ISO string)",
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  expiryBefore?: string;

  @ApiPropertyOptional({
    description:
      "Filter medicines with expiry date after this date (ISO string)",
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  expiryAfter?: string;

  @ApiPropertyOptional({
    description: "Filter medicines created after this date (ISO string)",
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: "Filter medicines created before this date (ISO string)",
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}
