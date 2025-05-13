import { ApiProperty } from "@nestjs/swagger";

export class ProductResponseDto {

  @ApiProperty({
    example: 1,
    description: 'Identificador único del producto',
  })
  id: number;

  @ApiProperty({
    example: '1234567890',
    description: 'SKU del producto',
  })
  sku: string;

  @ApiProperty({
    example: 'Producto de ejemplo',
    description: 'Nombre del producto',
  })
  name: string;

  @ApiProperty({
    example: 'Descripción del producto',
    description: 'Descripción del producto',
  })
  description?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de creación del producto',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de actualización del producto',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'Categoría de ejemplo',
    description: 'Nombre de la categoría del producto',
  })
  categoryName?: string;

  @ApiProperty({
    example: 10,
    description: 'Cantidad en inventario',
  })
  quantity: number;

  @ApiProperty({
    example: 'Almacén de ejemplo',
    description: 'Nombre del almacén donde está almacenado el producto',
  })
  warehouseName?: string;
}
