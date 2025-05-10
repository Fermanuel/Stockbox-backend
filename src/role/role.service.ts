import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DbService } from 'src/db/db.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {

  constructor(
    private readonly dbService: DbService,
  ) { }

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  async findAll() {
    try {
      return await this.dbService.role.findMany();
    }
    catch (error) {
      this.handleDBError(error);
    }
  }

  async findOne(id: number) {

    try {

      const role = await this.dbService.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new BadRequestException(`Role not found`);
      }

      return await this.dbService.role.findUnique({
        where: { id },
      });
    }
    catch (error) {
      this.handleDBError(error);
    }
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  // metodo para manejar los errores
  private handleDBError(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Error en la base de datos');
  }
}
