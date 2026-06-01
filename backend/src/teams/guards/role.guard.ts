import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service.js';

export const ROLES_KEY = 'roles';

export function RequireTeamRole(...roles: string[]): MethodDecorator & ClassDecorator {
  return (target: object, _key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value ?? target);
  };
}

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    if (!requiredRoles) {
      return true; // No role requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId || request.body?.teamId;

    if (!user || !teamId) {
      throw new ForbiddenException('User or Team not found in request');
    }

    for (const role of requiredRoles) {
      const hasRole = await this.permissionService.hasTeamRole(user.id, teamId, role);
      if (hasRole) {
        return true;
      }
    }

    this.logger.warn(
      `Access denied for user ${user.id} to team ${teamId}. Required roles: ${requiredRoles.join(', ')}`,
    );

    throw new ForbiddenException(
      `You do not have required permissions. Need one of: ${requiredRoles.join(', ')}`,
    );
  }
}
