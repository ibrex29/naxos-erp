import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "../types";

export class CreateUserDto {
  @ApiProperty({ description: "User full name", example: "John Michael Doe" })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ required: false, description: "User phone number", example: "+2348012345678" })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: "User email address", example: "johndoe@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", example: "StrongPassword123!" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    required: false,
    description: 'User role',
    enum: UserType,
    example: UserType.SALES_ADMIN,
  })
  @IsOptional()
  @IsEnum(UserType, { message: 'Role must be a valid UserType' })
  role?: UserType;

}
