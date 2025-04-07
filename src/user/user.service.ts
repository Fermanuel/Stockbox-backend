import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DbService } from 'src/db/db.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService
  ) { }

  async create(createUsuarioDto: CreateUserDto) {
    try {
      const { email, password, ...rest } = createUsuarioDto;

      // Verificar si el usuario ya existe en la base de datos
      const existingUser = await this.dbService.user.findUnique({
        where: {
          email
        }
      });

      if (existingUser) {
        throw new BadRequestException('Este Usuario ya existe, intente de nuevo');
      }

      // Crear nuevo usuario
      const newUser = await this.dbService.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          ...rest
        }
      });

      // Excluir el campo password del resultado
      const { password: _, ...user } = newUser;

      return {
        data: user
      };

    } catch (error) {

      this.logger.error(error);

      // Verificar si el error es de tipo BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleDBError(error);
    }
  }

  // Desactivar o activar un usuario
  async toggleUserStatus(id: string) {

    try {
      
      // Buscar usuario en la base de datos
      const user = await this.dbService.user.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          IsActive: true
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
          IsActive: !user.IsActive
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

    // Actualizar el rol del usuario
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    
    try {
      const { roles } = updateUserDto;

      // Buscar usuario en la base de datos
      const user = await this.dbService.user.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          roles: true
        }
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // Actualizar el rol del usuario
      const updatedUser = await this.dbService.user.update({
        where: {
          id
        },
        data: {
          roles
        }
      });

      // Excluir el campo password del resultado
      const { password: _, ...userData } = updatedUser;

      return {
        data: userData
      };

    } catch (error) {

      this.logger.error(error);

      // Verificar si el error es de tipo BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }

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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
