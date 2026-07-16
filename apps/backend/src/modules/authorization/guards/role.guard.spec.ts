import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../interfaces/system-role.enum';
import { AuthorizationService } from '../services/authorization.service';
import { RoleGuard } from './role.guard';

function buildContext(user?: { id: string }): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RoleGuard', () => {
  it('allows the request when no role metadata is present', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RoleGuard(reflector, {} as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
  });

  it('denies when a role is required but there is no authenticated user', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([SystemRole.EDITOR]) } as unknown as Reflector;
    const guard = new RoleGuard(reflector, { hasRole: jest.fn() } as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext(undefined))).resolves.toBe(false);
  });

  it('grants access when the user holds at least one of the required roles', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([SystemRole.EDITOR, SystemRole.ADMINISTRATOR]),
    } as unknown as Reflector;
    const hasRole = jest.fn((_userId: string, role: string) => Promise.resolve(role === SystemRole.EDITOR));
    const guard = new RoleGuard(reflector, { hasRole } as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
  });

  it('denies access when the user holds none of the required roles', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([SystemRole.SEO_MANAGER]) } as unknown as Reflector;
    const hasRole = jest.fn().mockResolvedValue(false);
    const guard = new RoleGuard(reflector, { hasRole } as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(false);
  });
});
