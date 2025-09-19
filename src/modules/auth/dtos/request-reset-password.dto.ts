import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address of the user requesting the password reset',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

}