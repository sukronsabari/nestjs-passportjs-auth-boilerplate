import { Role } from '@prisma/client';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RolesGuard } from '@/guards/roles.guard';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

/**
 * @description
 * Use this decorator's protected routes, and to specify authorization
 */

export const ROLES_KEY = 'roles';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
