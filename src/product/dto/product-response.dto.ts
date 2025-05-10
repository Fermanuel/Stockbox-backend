import { ApiProperty } from "@nestjs/swagger";


export class ProductResponseDto {

    @ApiProperty({
        example: 1,
        description: 'Identificador único del producto',
    })
    id: number; // ID del producto

    @ApiProperty({
        example: '1234567890',
        description: 'SKU del producto',
    })
    sku: string; // SKU del producto

    @ApiProperty({
        example: 'Producto de ejemplo',
        description: 'Nombre del producto',
    })
    name: string; // Nombre del producto

    @ApiProperty({
        example: 'Descripción del producto',
        description: 'Descripción del producto',
    })
    description?: string; // Descripción del producto

    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Fecha de creación del producto',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Fecha de creación del producto',
    })
    updatedAt: Date; // Fecha de actualización

    @ApiProperty({
        example: {
            name: 'Categoría de ejemplo',
        },
        description: 'Categoría del producto',
    })
    category?: {
        name: string; // Nombre de la categoría
    };
}