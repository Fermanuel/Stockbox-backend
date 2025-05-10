import { IsString, IsOptional, IsInt, MaxLength, IsDate, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    sku: string; // Código único de inventario

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string; // Nombre descriptivo

    @IsString()
    @IsOptional()
    description?: string; // Detalles adicionales

    @IsInt()
    @IsOptional()
    categoryId?: number; // Relación opcional con categoría

    @IsDate()
    @IsOptional()
    createdAt?: Date; // Fecha de creación

    @IsDate()
    @IsOptional()
    updatedAt?: Date; // Fecha de actualización
}
