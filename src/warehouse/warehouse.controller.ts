import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { WarehouseResponseDto } from './dto/warehouse-response.dto';

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

  @Get('all')
  @ApiOkResponse({
    description: 'Listado completo de warehouses',
    type: WarehouseResponseDto,
    isArray: true,
  })
  getAllWarehouses() {
    return this.warehouseService.getAllWarehouses();
  }
}
