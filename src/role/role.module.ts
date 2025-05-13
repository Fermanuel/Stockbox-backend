import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [
      DbModule, 
      forwardRef(() => AuthModule), 
    ]
})
export class RoleModule {}
