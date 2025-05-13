import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class WarehouseService {

  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async updateManagerWarehouse(managerId: number, warehouseId: number) {

    try {

      // Verificar si el manager existe
      const manager = await this.dbService.user.findUnique({
        where: {
          id: managerId,
        },
      });

      if (!manager) {
        throw new BadRequestException(`This manager does not exist`);
      }

      // validar si el manager ya tiene un warehouse asignado
      const warehouse = await this.dbService.warehouse.findFirst({
        where: {
          managerId: managerId,
        },
      });

      if (warehouse) {
        throw new BadRequestException(`This manager already has a warehouse assigned`);
      }

      // realizar la consulta para actualizar el warehouse
      await this.dbService.warehouse.update({
        where: {
          id: warehouseId,
        },
        data: {
          managerId: managerId,
        },
      });


      return {
        message: 'The manager has been assigned to the warehouse',
      };

    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async getAllWarehouses() {
    try {
      const warehouses = await this.dbService.warehouse.findMany({
        select: {
          id: true,
          name: true
        },
      });

      return warehouses;
      
    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never {

    if (error instanceof BadRequestException) {
      // Ya es una excepción con código 400
      throw error;
    }

    if (error.code === '23505') {
      // Violación de unicidad → 400 Bad Request
      throw new BadRequestException(error.detail);
    }

    // Cualquier otro error → 500 Internal Server Error
    throw new InternalServerErrorException('Error en la base de datos');
  }
}
