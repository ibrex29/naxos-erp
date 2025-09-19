import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatePasswordResetDto {
  @ApiProperty({
    description: 'Token for verifying the password reset request',
    example: '1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  resetToken: string;
}
