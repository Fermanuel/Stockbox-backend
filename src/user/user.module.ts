import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [DbModule, DbModule]
})
export class UserModule {}
