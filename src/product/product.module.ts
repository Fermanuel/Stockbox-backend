import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
    imports: [
      DbModule, 
      forwardRef(() => AuthModule), 
    ]
})
export class ProductModule {}
