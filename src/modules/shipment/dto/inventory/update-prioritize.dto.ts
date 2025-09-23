import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdatePrioritizeDTO {
  @ApiProperty({
    description: "Mark batch as prioritized",
    example: true,
  })
  @IsBoolean()
  priority: boolean;
}
