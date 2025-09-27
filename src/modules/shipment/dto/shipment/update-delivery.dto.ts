import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { DeliveryStatusEnum } from "../../enum/shipment.enum";

export class UpdateDeliveryStatusDTO {
  @ApiProperty({
    description: "New delivery status of the shipment",
    enum: DeliveryStatusEnum,
    example: DeliveryStatusEnum.IN_TRANSIT,
  })
  @IsEnum(DeliveryStatusEnum)
  deliveryStatus: DeliveryStatusEnum;
}
