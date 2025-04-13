import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-usuario.dto';
import { Auth } from './decorators/auth.decorator';
import { User } from '@prisma/client';
import { GetUser } from './decorators/get-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('login')
  singIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.singIn(loginUserDto);
  }

  // REFRESH TOKEN (sirve para renovar el token una vez que ha expirado)
  @ApiBearerAuth()
  @Get('refresh-token')
  @Auth('Administrador')
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Auth()
  @ApiBearerAuth()
  @Get('permission/:id')
  getPermission(@Param('id') id: number) {
    return this.userService.getUserMenus(id);
  }
}