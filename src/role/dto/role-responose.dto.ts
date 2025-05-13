import { ApiProperty } from "@nestjs/swagger";


export class RoleResponseDto {

    @ApiProperty({
        example: 1,
        description: 'Identificador único del rol',
    })
    id: number;

    @ApiProperty({
        example: 'Administrador',
        description: 'Nombre del rol',
    })
    name: string;
}