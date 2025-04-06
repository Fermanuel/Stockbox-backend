import { Controller, Get, Post, Body, Patch, ParseUUIDPipe, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-usuario.dto';
import { LoginUserDto } from './dto/login-usuario.dto';
import { Auth } from './decorators/auth.decorator';
import { Role, User } from '@prisma/client';
import { GetUser } from './decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-usuario.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  // solo el administrador puede registrar usuarios
  @ApiBearerAuth()
  @Auth(Role.ADMINISTRADOR)
  @Post('register')
  createUser(@Body() createUsuarioDto: CreateUserDto) {
    return this.authService.create(createUsuarioDto);
  }

  @Post('login')
  login(@Body() loginUserDto : LoginUserDto ) {
    return this.authService.login(loginUserDto);
  }

  // REFRESH TOKEN (sirve para renovar el token una vez que ha expirado)
  @ApiBearerAuth()
  @Get('refresh-token')
  @Auth(Role.USUARIO, Role.ADMINISTRADOR)
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  // ENDPOINT PARA ACTUALIZAR EL ROL
  @ApiBearerAuth()
  @Auth(Role.ADMINISTRADOR)
  @Patch('role/:id')
  UpdateUser(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto){

    return this.authService.updateUser(id, updateUserDto);
  }

  // ENDPOINT PARA DESACTIVAR USUARIOS O ACTIVARLOS
  @ApiBearerAuth()
  @Auth(Role.ADMINISTRADOR)
  @Patch('status/:id')
  DesactivUser(@Param('id', ParseUUIDPipe) id: string){
    return this.authService.toggleUserStatus(id);
  }

}
