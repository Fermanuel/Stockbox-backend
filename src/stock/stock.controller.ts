import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WithdrawStockDto } from './dto/withdrawStock.dto';

//@ApiBearerAuth()
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

  @Post('withdraw')
  async withdraw(
    @Body() stockDto: WithdrawStockDto,
  ) {
    return this.stockService.withdrawStock(stockDto, 2121071);
  }
}
