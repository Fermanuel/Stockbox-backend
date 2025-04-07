import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class UsuarioRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Se obtienen los roles válidos definidos en el decorador
    const validRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    if (!validRoles || validRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Verificamos que el usuario tenga la relación Role cargada
    if (!user || !user.Role) {
      throw new ForbiddenException('User does not have an assigned role, contact the administrator');
    }

    // Comparamos el nombre del rol del usuario con los roles permitidos
    const userRoleName = user.Role.name;
    if (validRoles.includes(userRoleName)) {
      return true;
    } else {
      throw new ForbiddenException(`Required role(s): ${validRoles.join(', ')}`);
    }
  }
}
