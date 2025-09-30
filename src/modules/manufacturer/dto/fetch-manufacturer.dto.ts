import { FetchDTO } from "@/common/dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsEnum, IsString, IsBoolean } from "class-validator";

export enum ManufacturerSortFieldEnum {
  name = "name",
  code = "code",
  email = "email",
  phone = "phone",
  country = "country",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
}

export class FetchManufacturerDTO extends FetchDTO {
  @ApiPropertyOptional({
    enum: ManufacturerSortFieldEnum,
    example: "createdAt",
    description: "Field to sort manufacturers by",
  })
  @IsOptional()
  @IsEnum(ManufacturerSortFieldEnum)
  sortField?: ManufacturerSortFieldEnum = ManufacturerSortFieldEnum.createdAt;

  @ApiPropertyOptional({
    description: "Search manufacturers by name, code, email, or phone",
    example: "Pfizer",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by country",
    example: "USA",
  })
  @IsOptional()
  @IsString()
  country?: string;


  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isActive?: boolean;
}
