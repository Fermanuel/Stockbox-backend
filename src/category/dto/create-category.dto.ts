import { IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string; // Nombre de la categoría
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MinLength(10)
    description?: string; // Descripción de la categoría
}
