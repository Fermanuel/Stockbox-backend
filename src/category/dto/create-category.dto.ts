import { IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    @Min(3)
    @Max(50)
    name: string; // Nombre de la categoría
    
    @IsString()
    @Min(3)
    @Max(50)
    @IsNotEmpty()
    @IsOptional()
    description?: string; // Descripción de la categoría
}
