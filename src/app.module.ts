import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    DbModule, 
    AuthModule, 
    ConfigModule.forRoot({}), UserModule,
    UserModule,
    RoleModule,
    ProductModule,
    CategoryModule,
    WarehouseModule,
    StockModule
  ],
})
export class AppModule {}
