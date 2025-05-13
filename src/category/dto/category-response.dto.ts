import { ApiProperty } from "@nestjs/swagger";


export class CategoryResponseDto {

    @ApiProperty({
        example: 1,
        description: 'Identificador único del categoría',
    })
    id: number; // ID de la categoría

    @ApiProperty({
        example: 'Valvulas',
        description: 'Nombre de la categoría',
    })
    name: string; // Nombre de la categoría

    @ApiProperty({
        example: 'Valvulas de todo tipo',
        description: 'Descripción de la categoría',
    })
    description?: string; // Descripción de la categoría
}