import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async create(createUsuarioDto: CreateUserDto) {
    try {
      const { email, password, ...rest } = createUsuarioDto;

      // Verificar si el usuario ya existe en la base de datos
      const existingUser = await this.dbService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('Este Usuario ya existe, intente de nuevo');
      }

      // Obtener roleId del DTO, o asignar por defecto "BIBLIOTECARIO" si no se proporcionó
      let { roleId } = rest;

      if (!roleId) {
        const defaultRole = await this.dbService.role.findUnique({
          where: { name: 'BIBLIOTECARIO' },
        });
        if (!defaultRole) {
          throw new InternalServerErrorException('Default role not found');
        }
        roleId = defaultRole.id;
      }

      const newUser = await this.dbService.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          ...rest,
          roleId,
        },
        include: {
          Role: {
            select: {
              name: true, // Solo el nombre del rol
            },
          }, // Incluye la relación con la tabla Role
        },
      });

      // Excluir campos sensibles
      const { password: _password, roleId: _roleId, Role, ...userData } = newUser;

      // Aplanar la respuesta para que 'role' sea solo el nombre
      return {
        data: {
          ...userData,
          role: Role.name, // Aplanamos el objeto 'Role' a solo su nombre
        },
      };

    } catch (error) {
      this.logger.error(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleDBError(error);
    }
  }

  // Desactivar o activar un usuario
  async toggleUserStatus(id: number) {

    try {

      // Buscar usuario en la base de datos
      const user = await this.dbService.user.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          isActive: true
        }
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // Actualizar el estado del usuario
      const updatedUser = await this.dbService.user.update({
        where: {
          id
        },
        data: {
          isActive: !user.isActive
        }
      });

      // Excluir el campo password del resultado
      const { password: _, ...userData } = updatedUser;

      return userData;

    } catch (error) {

      this.logger.error(error);

      // Verificar si el error es de tipo BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleDBError(error);
    }
  }


  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {

      const existing = await this.dbService.user.findUnique({
        where: { id },
        select: { id: true }
      });
      if (!existing) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const data: Partial<UpdateUserDto> = { ...updateUserDto };
      if (updateUserDto.password) {
        data.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updated = await this.dbService.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          isActive: true,
          Role: {
            select: { name: true }
          }
        },
      });

      return {
        data: {
          ...updated,
          role: updated.Role.name,
        },
      };

    } catch (error) {
      this.logger.error(error);
      if (error instanceof BadRequestException) throw error;
      this.handleDBError(error);
    }
  }


  async getAllUsers() {
    try {

      const users = await this.dbService.user.findMany({
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          isActive: true,
          Role: {
            select: {
              name: true,
            },
          },
        },
      });

      return users.map(({ Role, ...rest }) => ({
        ...rest,
        role: Role.name,
      }));

    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  // metodo para manejar los errores
  private handleDBError(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Error en la base de datos');
  }
}
