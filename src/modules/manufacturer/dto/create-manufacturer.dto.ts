import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateManufacturerDto {
  @ApiProperty({ example: 'Pfizer', description: 'Name of the manufacturer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'PFZ-001', description: 'Unique manufacturer code', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'info@pfizer.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'New York, USA', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
