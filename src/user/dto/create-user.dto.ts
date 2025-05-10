import { 
  IsEmail, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsStrongPassword, 
  MaxLength, 
  MinLength 
} from "class-validator";

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

  @IsNumber()
  @IsOptional()
  roleId?: number;
}
