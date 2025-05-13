import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { parse } from 'path';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Warehouse')
@ApiBearerAuth()
@Auth('Administrador')
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) { }


  @Patch('update/manager/:managerId/:warehouseId')
  updateManagerWarehouse(
    @Param('managerId', ParseIntPipe) managerId: number,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.warehouseService.updateManagerWarehouse(managerId, warehouseId);
  }

}
