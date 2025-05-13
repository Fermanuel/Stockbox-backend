import { forwardRef, Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService],
  imports: [
    DbModule,
    forwardRef(() => AuthModule),
  ]
})
export class WarehouseModule { }
