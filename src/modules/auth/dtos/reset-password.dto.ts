import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty({
    description: 'Email address of the user requesting the password reset',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The new password for the user',
    example: 'newSecurePassword123',
    minLength: 3,
  })
  @IsNotEmpty()
  @MinLength(3)
  newPassword: string;

  @ApiProperty({
    description: 'Token for verifying the password reset request',
    example: '1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  resetToken: string;
}
