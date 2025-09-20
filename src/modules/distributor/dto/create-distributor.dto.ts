import { 
  IsEnum, 
  IsOptional, 
  IsString, 
  IsEmail, 
  IsNumber, 
  Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DistributorType, Currency } from '@prisma/client';

export class CreateDistributorDto {
  @ApiProperty({
    description: 'Legal or registered name of the distributor (e.g., Aminu Pharmacy Ltd.)',
    example: 'HealthPlus Pharmacy Ltd.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of distributor based on business category',
    enum: DistributorType,
    example: DistributorType.PHARMACY,
  })
  @IsEnum(DistributorType)
  type: DistributorType;

  @ApiPropertyOptional({
    description: 'Official contact email for the distributor',
    example: 'contact@healthplus.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primary contact phone number of the distributor',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Physical business address of the distributor',
    example: '23 Hospital Road, Kano, Nigeria',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Maximum allowed credit for this distributor in local currency',
    example: 500000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({
    description: 'Preferred currency for transactions',
    enum: Currency,
    example: Currency.NGN,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
