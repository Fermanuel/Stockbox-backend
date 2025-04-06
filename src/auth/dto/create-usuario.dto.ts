import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";


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

    @IsEnum(Role, { each: true })
    @IsOptional()
    @IsArray()
    @ApiProperty({ enum: Role})
    roles?: Role[] = [Role.ADMINISTRADOR];

    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}
