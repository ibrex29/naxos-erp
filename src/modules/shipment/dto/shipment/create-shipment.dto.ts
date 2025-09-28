import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { MedicineFormEnum, ShipmentMode } from "../../enum/shipment.enum";

export class MedicineDto {
  @ApiProperty({ example: "Paracetamol", description: "Medicine name" })
  @IsString()
  name: string;

  @ApiProperty({
    enum: MedicineFormEnum,
    example: MedicineFormEnum.TABLET,
    description: "Dosage form of the medicine",
  })
  @IsEnum(MedicineFormEnum)
  @IsOptional()
  form: MedicineFormEnum;

  @ApiProperty({
    example: "Pfizer",
    description: "Manufacturer of the medicine",
  })
  @IsString()
  @IsOptional()
  manufacturer: string;

  @ApiProperty({ example: "500mg", description: "Strength of the medicine" })
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiProperty({ example: "BN-2025-001", description: "Batch number" })
  @IsString()
  batchNumber: string;

  @ApiProperty({
    example: "2026-05-20",
    description: "Expiry date (YYYY-MM-DD)",
  })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({
    example: 100,
    description: "Pack size (e.g., number of tablets/capsules per pack)",
  })
  @IsNumber()
  packSize: number;

  @ApiProperty({
    example: "India",
    description: "Country where the medicine was manufactured",
  })
  @IsString()
  countryOfOrigin: string;

  @ApiProperty({
    example: "2024-09-15",
    description: "Manufacturing date (YYYY-MM-DD)",
  })
  @IsDateString()
  manufacturingDate: string;

  @ApiProperty({
    example: 500,
    description: "Quantity of medicine in this shipment",
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 12.5, description: "Unit cost per medicine" })
  @IsNumber()
  unitCost: number;
}

class ShipmentItemDto {
  @ApiProperty({
    type: MedicineDto,
    description: "Medicine details to create along with shipment",
  })
  @ValidateNested()
  @Type(() => MedicineDto)
  medicine: MedicineDto;
}

export class CreateShipmentDto {
  @ApiProperty({
    example: "PI-2025-009",
    description: "Proforma Invoice number",
  })
  @IsString()
  proformaInvoiceNo: string;

  @ApiProperty({ example: "BL-2025-012", description: "Bill of Lading number" })
  @IsString()
  billOfLading: string;

  @ApiProperty({ example: "Global Pharma Ltd.", description: "Supplier name" })
  @IsString()
  supplier: string;

  @ApiProperty({
    enum: ShipmentMode,
    example: ShipmentMode.SEA,
    description: "Mode of shipment",
  })
  @IsEnum(ShipmentMode)
  shipmentMode: ShipmentMode;

  @ApiProperty({
    example: "2025-09-15",
    required: false,
    description: "Date shipment was received",
  })
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @ApiProperty({
    example: [
      { invoiceDoc: "invoice.pdf", qualityCheck: "qc_report.pdf" },
      { packingList: "packing_list.pdf", insurance: "insurance_doc.pdf" },
    ],
    required: false,
    description:
      "Optional supporting documents (any structure, stored as JSON)",
  })
  @IsOptional()
  documents?: any;
  @ApiProperty({
    type: [ShipmentItemDto],
    description: "List of shipment items with nested medicine details",
    example: [
      {
        medicine: {
          name: "Paracetamol",
          form: MedicineFormEnum.TABLET,
          manufacturer: "Pfizer",
          strength: "500mg",
          batchNumber: "BN-2025-001",
          expiryDate: "2026-05-20",
          manufacturingDate: "2024-09-15",
          packSize: 100,
          countryOfManufacture: "India",
          quantity: 500,
          unitCost: 12.5,
        },
      },
      {
        medicine: {
          name: "Amoxicillin",
          form: MedicineFormEnum.CAPSULE,
          manufacturer: "GSK",
          strength: "250mg",
          batchNumber: "BN-2025-002",
          expiryDate: "2027-01-10",
          manufacturingDate: "2025-01-01",
          packSize: 50,
          countryOfManufacture: "Germany",
          quantity: 300,
          unitCost: 8.0,
        },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items: ShipmentItemDto[];
}
