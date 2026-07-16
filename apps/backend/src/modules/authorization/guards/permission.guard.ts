import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { REQUIRE_ALL_PERMISSIONS_KEY, REQUIRE_ANY_PERMISSION_KEY, REQUIRE_PERMISSION_KEY } from '../authorization.constants';
import { AuthorizationService } from '../services/authorization.service';

/**
 * Focused, single-concern guard: enforces @RequirePermission()/
 * @RequireAnyPermission()/@RequireAllPermissions() only. Not registered
 * globally (Milestone 5 — "business modules will opt-in later" via
 * `@UseGuards(PermissionGuard)`).
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSION_KEY, targets);
    const anyOf = this.reflector.getAllAndOverride<string[]>(REQUIRE_ANY_PERMISSION_KEY, targets);
    const allOf = this.reflector.getAllAndOverride<string[]>(REQUIRE_ALL_PERMISSIONS_KEY, targets);

    if (!required?.length && !anyOf?.length && !allOf?.length) {
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
    return true;
  }
}
