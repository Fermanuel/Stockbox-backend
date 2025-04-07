import { Controller, Get, Post, Body, Patch, ParseUUIDPipe, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-usuario.dto';
import { Auth } from './decorators/auth.decorator';
import { Role, User } from '@prisma/client';
import { GetUser } from './decorators/get-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  singIn(@Body() loginUserDto : LoginUserDto ) {
    return this.authService.singIn(loginUserDto);
  }

  // REFRESH TOKEN (sirve para renovar el token una vez que ha expirado)
  @ApiBearerAuth()
  @Get('refresh-token')
  @Auth(Role.ADMINISTRADOR)
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

}
