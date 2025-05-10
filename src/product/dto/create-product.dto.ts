import { IsString, IsOptional, IsInt, MaxLength, IsNotEmpty, IsNumber } from 'class-validator';

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

    @IsNumber()
    quantity: number; // Cantidad en inventario

    @IsNumber()
    warehouseId: number; // Relación con almacén
}
