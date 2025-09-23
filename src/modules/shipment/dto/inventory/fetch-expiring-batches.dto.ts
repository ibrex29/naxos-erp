import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsInt, Min } from "class-validator";

export class FetchExpiringBatchesDTO {
  @ApiPropertyOptional({
    description: "Number of days to check for expiry",
    example: 90,
    default: 90,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number = 90;
}
