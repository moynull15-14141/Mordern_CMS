import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../services/authorization.service';
import { PermissionGuard } from './permission.guard';

function buildContext(user?: { id: string }): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('PermissionGuard', () => {
  it('allows the request when no permission metadata is present', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const authorizationService = {} as unknown as AuthorizationService;
    const guard = new PermissionGuard(reflector, authorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
  });

  it('denies when metadata is present but there is no authenticated user', async () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => (key.includes('require_permission') ? ['article.create'] : undefined)),
    } as unknown as Reflector;
    const authorizationService = { hasAllPermissions: jest.fn() } as unknown as AuthorizationService;
    const guard = new PermissionGuard(reflector, authorizationService);

    await expect(guard.canActivate(buildContext(undefined))).resolves.toBe(false);
  });

  it('grants access when hasAllPermissions resolves true for @RequirePermission', async () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === 'authz:require_permission' ? ['article.create'] : undefined,
      ),
    } as unknown as Reflector;
    const hasAllPermissions = jest.fn().mockResolvedValue(true);
    const authorizationService = { hasAllPermissions } as unknown as AuthorizationService;
    const guard = new PermissionGuard(reflector, authorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
    expect(hasAllPermissions).toHaveBeenCalledWith('user-1', ['article.create']);
  });

  it('denies access when the required permission check fails', async () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === 'authz:require_permission' ? ['article.delete'] : undefined,
      ),
    } as unknown as Reflector;
    const authorizationService = {
      hasAllPermissions: jest.fn().mockResolvedValue(false),
    } as unknown as AuthorizationService;
    const guard = new PermissionGuard(reflector, authorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(false);
  });

  it('checks @RequireAnyPermission with OR semantics', async () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === 'authz:require_any_permission' ? ['article.create', 'article.update'] : undefined,
      ),
    } as unknown as Reflector;
    const hasAnyPermission = jest.fn().mockResolvedValue(true);
    const authorizationService = { hasAnyPermission } as unknown as AuthorizationService;
    const guard = new PermissionGuard(reflector, authorizationService);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }))).resolves.toBe(true);
    expect(hasAnyPermission).toHaveBeenCalledWith('user-1', ['article.create', 'article.update']);
  });
});
