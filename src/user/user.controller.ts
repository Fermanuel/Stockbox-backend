import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) { }

  // ENDPOINT PARA ACTUALIZAR EL ROL
  @ApiBearerAuth()
  @Auth('ADMINISTRADOR')
  @Patch('role/:id')
  UpdateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

    return this.userService.updateUser(id, updateUserDto);
  }

  // solo el administrador puede registrar usuarios
  // @ApiBearerAuth()
  // @Auth('ADMINISTRADOR')
  @Post('register')
  createUser(@Body() createUsuarioDto: CreateUserDto) {
    return this.userService.create(createUsuarioDto);
  }

  // ENDPOINT PARA DESACTIVAR USUARIOS O ACTIVARLOS
  @ApiBearerAuth()
  @Auth('ADMINISTRADOR')
  @Patch('status/:id')
  DesactivUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.toggleUserStatus(id);
  }
}
