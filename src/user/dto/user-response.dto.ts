import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del usuario',
  })
  id: number;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  first_name: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    required: false,
  })
  last_name?: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico',
  })
  email: string;

  @ApiProperty({
    example: "Administrador",
    description: 'nombre del rol',
    required: false,
  })
  roleId?: string;
}
