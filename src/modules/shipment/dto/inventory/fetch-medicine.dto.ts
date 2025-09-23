import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

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
}
