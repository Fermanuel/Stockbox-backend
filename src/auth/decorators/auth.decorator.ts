import { UseGuards, applyDecorators } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UsuarioRolesGuard } from '../guards/usuario-roles.guard';

export function Auth(...roles: string[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UsuarioRolesGuard),
  );
}
