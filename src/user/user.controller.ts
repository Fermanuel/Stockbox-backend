import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) { }

  // ENDPOINT PARA ACTUALIZAR EL ROL
  //@ApiBearerAuth()
  //@Auth('Administrador')
  @Patch('update/:id')
  UpdateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

    return this.userService.updateUser(id, updateUserDto);
  }

  // solo el administrador puede registrar usuarios
  //@ApiBearerAuth()
  //@Auth('Administrador')
  @Post('register')
  createUser(@Body() createUsuarioDto: CreateUserDto) {
    return this.userService.create(createUsuarioDto);
  }

  // ENDPOINT PARA DESACTIVAR USUARIOS O ACTIVARLOS
  @ApiBearerAuth()
  @Auth('Administrador')
  @Patch('status/:id')
  DesactivUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.toggleUserStatus(id);
  }

  // ENDPOINT PARA OBTENER TODOS LOS USUARIOS
  @ApiBearerAuth()
  @Auth('Administrador')
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
