import { IsNotEmpty, IsNumber, IsString, Max, Min, MinLength } from "class-validator";

export class CreateRoleDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;
}
