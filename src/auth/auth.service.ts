import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';

import { LoginUserDto } from './dto/login-usuario.dto';
import { DbService } from 'src/db/db.service';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-paylot.interface';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService
  ) {
  }


  async singIn(loginUserDto: LoginUserDto) {

    try {

      const { email, password } = loginUserDto;

      // Buscar usuario en la base de datos e incluir el nombre del rol
      const user = await this.dbService.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          password: true,
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


      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar si el usuario esta activo
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario suspendido, contacte al administrador');
      }

      // Verificar la contraseña
      const passwordMatch = bcrypt.compareSync(password, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      // Excluir el campo password del resultado
      const { password: _, ...userData } = user;

      return {
        data: userData,
        token: this.getJwtToken({ id: user.id }),
      };


    } catch (error) {

      this.logger.error(error);

      // Verificar si el error es de tipo UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.handleDBError(error);

    }
  }

  //* GENERACION DE TOKEN
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
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
