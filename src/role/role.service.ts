import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DbService } from 'src/db/db.service'; 

@Injectable()
export class RoleService {

  constructor(
    private readonly dbService: DbService,
  ) { }

  create(createRoleDto: CreateRoleDto) {
  
    try {
      // verificar si el rol ya existe
      const roleExists = this.dbService.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (roleExists) {
        throw new BadRequestException(`Role ${createRoleDto.name} already exists`);
      }

      // crear el rol
      return this.dbService.role.create({
        data: createRoleDto,
      });
    }
    catch (error) {
      this.handleDBError(error);
    }
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
    try {
      const role = this.dbService.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new BadRequestException(`Role not found`);
      }

      return this.dbService.role.update({
        where: { id },
        data: updateRoleDto,
      });
    }
    catch (error) {
      this.handleDBError(error);
    }
  }

  remove(id: number) {
  
    try {
      const role = this.dbService.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new BadRequestException(`Role not found`);
      }

      return this.dbService.role.update({
        data: { isActive: false },
        where: { id },
      });
    }
    catch (error) {
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
