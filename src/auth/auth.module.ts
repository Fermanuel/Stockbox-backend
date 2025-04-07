import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from 'src/db/db.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  
  controllers: [AuthController],
  
  providers: [AuthService, JwtStrategy],
  
  imports: [
    DbModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h'
          }
        }
      }
    })
  ],

  exports: [JwtStrategy, PassportModule, JwtModule],

})
export class AuthModule {}
