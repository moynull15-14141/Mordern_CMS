import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import {
  REQUIRE_ALL_PERMISSIONS_KEY,
  REQUIRE_ANY_PERMISSION_KEY,
  REQUIRE_PERMISSION_KEY,
  REQUIRE_ROLE_KEY,
} from '../authorization.constants';
import { AuthorizationService } from '../services/authorization.service';

/**
 * Combined convenience guard: checks every authorization decorator
 * (@RequirePermission/@RequireAnyPermission/@RequireAllPermissions/
 * @RequireRole) in one place, for controllers that want a single guard
 * instead of stacking PermissionGuard + RoleGuard. Not registered globally
 * — opt-in via `@UseGuards(AuthorizationGuard)`.
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSION_KEY, targets);
    const anyOf = this.reflector.getAllAndOverride<string[]>(REQUIRE_ANY_PERMISSION_KEY, targets);
    const allOf = this.reflector.getAllAndOverride<string[]>(REQUIRE_ALL_PERMISSIONS_KEY, targets);
    const roles = this.reflector.getAllAndOverride<string[]>(REQUIRE_ROLE_KEY, targets);

    const hasAnyRequirement = [required, anyOf, allOf, roles].some((list) => list?.length);
    if (!hasAnyRequirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const userId = request.user?.id;
    if (!userId) {
      return false;
    }

    if (required?.length && !(await this.authorizationService.hasAllPermissions(userId, required))) {
      return false;
    }
    if (anyOf?.length && !(await this.authorizationService.hasAnyPermission(userId, anyOf))) {
      return false;
    }
    if (allOf?.length && !(await this.authorizationService.hasAllPermissions(userId, allOf))) {
      return false;
    }
    if (roles?.length) {
      const checks = await Promise.all(roles.map((role) => this.authorizationService.hasRole(userId, role)));
      if (!checks.some(Boolean)) {
        return false;
      }
    }
    return true;
  }
}
