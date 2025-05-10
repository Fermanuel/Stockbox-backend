import {  
    IsEmail, 
    IsNumber, 
    IsOptional, 
    IsString, 
    IsStrongPassword, 
    MaxLength, 
    MinLength 
} from 'class-validator';

export class UpdateUserDto {

    @IsString()
    @IsEmail()
    @MaxLength(30)
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsOptional()
    first_name?: string;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    last_name?: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsStrongPassword()
    @IsOptional()
    password?: string;

    @IsNumber()
    @IsOptional()
    roleId?: number;
}

