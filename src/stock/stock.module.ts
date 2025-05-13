import { forwardRef, Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StockController],
  providers: [StockService],
  imports: [
    DbModule,
    forwardRef(() => AuthModule),
  ]
})
export class StockModule { }
