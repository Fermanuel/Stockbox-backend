import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateRoleDto {

    @IsString()
    @IsNotEmpty()
    @Min(3)
    @Max(50) 
    name: string;
}
