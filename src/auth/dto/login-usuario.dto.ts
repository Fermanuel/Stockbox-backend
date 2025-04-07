import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}