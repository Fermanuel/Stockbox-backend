import { ApiProperty } from "@nestjs/swagger";

export class WarehouseResponseDto {

    @ApiProperty({
        example: '1',
        description: 'El ID del warehouse',
    })
    id: number;

    @ApiProperty({
        example: 'Warehouse 1',
        description: 'El nombre del warehouse',
    })
    name: string;
}