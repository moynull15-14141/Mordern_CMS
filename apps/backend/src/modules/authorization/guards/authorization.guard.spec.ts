import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../interfaces/system-role.enum';
import { AuthorizationService } from '../services/authorization.service';
import { AuthorizationGuard } from './authorization.guard';

function buildContext(user?: { id: string }): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('AuthorizationGuard (combined)', () => {
  it('allows the request when no authorization metadata is present at all', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new AuthorizationGuard(reflector, {} as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
  });

  it('checks permission AND role requirements together, passing only when both are satisfied', async () => {
    const metadata: Record<string, string[]> = {
      'authz:require_permission': ['article.publish'],
      'authz:require_role': [SystemRole.EDITOR],
    };
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => metadata[key]),
    } as unknown as Reflector;
    const hasAllPermissions = jest.fn().mockResolvedValue(true);
    const hasRole = jest.fn().mockResolvedValue(true);
    const guard = new AuthorizationGuard(reflector, {
      hasAllPermissions,
      hasRole,
    } as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
    expect(hasAllPermissions).toHaveBeenCalledWith('user-1', ['article.publish']);
    expect(hasRole).toHaveBeenCalledWith('user-1', SystemRole.EDITOR);
  });

  it('fails if the permission check passes but the role check fails', async () => {
    const metadata: Record<string, string[]> = {
      'authz:require_permission': ['article.publish'],
      'authz:require_role': [SystemRole.EDITOR],
    };
    const reflector = { getAllAndOverride: jest.fn((key: string) => metadata[key]) } as unknown as Reflector;
    const guard = new AuthorizationGuard(reflector, {
      hasAllPermissions: jest.fn().mockResolvedValue(true),
      hasRole: jest.fn().mockResolvedValue(false),
    } as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(false);
  });

  it('denies when metadata is present but there is no authenticated user', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([SystemRole.EDITOR]),
    } as unknown as Reflector;
    const guard = new AuthorizationGuard(reflector, {} as unknown as AuthorizationService);

    await expect(guard.canActivate(buildContext(undefined))).resolves.toBe(false);
  });
});
