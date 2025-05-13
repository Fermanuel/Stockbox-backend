import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleResponseDto } from './dto/role-responose.dto';

@ApiTags('Role')
//@ApiBearerAuth()
//@Auth('Administrador')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }


  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('all')
  @ApiOkResponse({
    description: 'Rol encontrado',
    type: RoleResponseDto,
  })
  findAll() {
    return this.roleService.findAll();
  }

  @Get('find-one/:id')
  @ApiOkResponse({
    description: 'Rol encontrado',
    type: RoleResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
