import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneLoginDto {
  @ApiProperty({ example: '+2348012345678' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'The user\'s password.',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
