import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiBearerAuth()
  @Auth('Administrador')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiBearerAuth()
  @Auth('Administrador')
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @ApiBearerAuth()
  @Auth('Administrador')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @ApiBearerAuth()
  @Auth('Administrador')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiBearerAuth()
  @Auth('Administrador')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
