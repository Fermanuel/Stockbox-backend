import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { parse } from 'path';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Warehouse')
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) { }

  // @Post()
  // create(@Body() createWarehouseDto: CreateWarehouseDto) {
  //   return this.warehouseService.create(createWarehouseDto);
  // }

  // @Get()
  // findAll() {
  //   return this.warehouseService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.warehouseService.findOne(+id);
  // }

  @Patch('update/manager/:managerId/:warehouseId')
  update(
    @Param('managerId', ParseIntPipe) managerId: number,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.warehouseService.updateManagerWarehouse(managerId, warehouseId);
  }

}
