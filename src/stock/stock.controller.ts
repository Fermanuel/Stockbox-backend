import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post('create-transfer')
  createTrasferStock(@Body() createStockDto: CreateStockDto) {
    return this.stockService.createTrasferStock(createStockDto);
  }

  @Get('all-transfer')
  findAll() {
    return this.stockService.findAllTransferStock();
  }

  @Patch('complete-transfer/:id')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.completeTransfer(id);
  }
}
