import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { REQUIRE_ROLE_KEY } from '../authorization.constants';
import { AuthorizationService } from '../services/authorization.service';

/**
 * Focused, single-concern guard: enforces @RequireRole() only ("is the user
 * one of X", direct or inherited). Not registered globally — opt-in via
 * `@UseGuards(RoleGuard)`.
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const userId = request.user?.id;
    if (!userId) {
      return false;
    }

    const checks = await Promise.all(required.map((role) => this.authorizationService.hasRole(userId, role)));
    return checks.some(Boolean);
  }
}
