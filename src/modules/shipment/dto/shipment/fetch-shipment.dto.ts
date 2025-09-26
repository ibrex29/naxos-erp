import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { StockMovementType } from "@prisma/client";
import { IsOptional, IsEnum, IsString } from "class-validator";
import { DeliveryStatusEnum } from "../../enum/shipment.enu";

export enum ShipmentSortFieldEnum {
  proformaInvoiceNo = "proformaInvoiceNo",
  billOfLading = "billOfLading",
  supplier = "supplier",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
}

export class FetchShipmentDTO extends FetchDTO {
  @ApiPropertyOptional({
    enum: ShipmentSortFieldEnum,
    example: "createdAt",
    description: "Field to sort shipments by",
  })
  @IsOptional()
  @IsEnum(ShipmentSortFieldEnum)
  sortField?: ShipmentSortFieldEnum = ShipmentSortFieldEnum.createdAt;

  @ApiPropertyOptional({
    description: "Search shipments by invoice number, BL, or supplier",
    example: "PI-2025-009",
  })
  @IsOptional()
  @IsString()
  search?: string;

    @ApiPropertyOptional({
    description: "Filter by stock movement type",
    enum: StockMovementType,
    example: StockMovementType.IN,
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  status?: StockMovementType;

  @ApiPropertyOptional({
    description: "Filter by delivery status",
    enum: DeliveryStatusEnum,
    example: DeliveryStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(DeliveryStatusEnum)
  deliveryStatus?: DeliveryStatusEnum;

}
