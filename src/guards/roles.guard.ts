import { Request } from 'express';
import { Observable } from 'rxjs';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '@prisma/client';
import { ROLES_KEY } from '@/decorators/auth.decorator';
import { TokenPayload } from '@/interfaces/token-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles.length) {
      console.log('PUBLIC');
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tokenPayload = request.user as TokenPayload;

    return requiredRoles.some(
      (role) => tokenPayload.role?.toUpperCase() === role?.toUpperCase(),
    );
  }
}
