import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @MaxLength(30)
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  first_name: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @IsStrongPassword()
  password: string;

  // En lugar de enviar un array de roles, ahora se envía el id del rol.
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Role id assigned to the user",
    example: "d92b4f8c-1234-5678-90ab-1c2d3e4f5a6b",
  })
  roleId?: number;

  @IsBoolean()
  @IsOptional()
  IsActive?: boolean;
}
