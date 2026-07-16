import { SystemRole } from '../interfaces/system-role.enum';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { AuthorizationService } from './authorization.service';

function buildService(directRoles: string[], permissionsByRoles: string[]) {
  const userRoleRepository = {
    findRoleNamesForUser: jest.fn().mockResolvedValue(directRoles),
  } as unknown as UserRoleRepository;
  const rolePermissionRepository = {
    findPermissionKeysForRoleNames: jest.fn().mockResolvedValue(permissionsByRoles),
  } as unknown as RolePermissionRepository;

  const service = new AuthorizationService(userRoleRepository, rolePermissionRepository);
  return { service, userRoleRepository, rolePermissionRepository };
}

describe('AuthorizationService', () => {
  describe('resolveInheritedRoles', () => {
    it('delegates to the frozen role hierarchy expansion', () => {
      const { service } = buildService([], []);
      const result = service.resolveInheritedRoles([SystemRole.EDITOR]);
      expect(result).toEqual(
        expect.arrayContaining([SystemRole.EDITOR, SystemRole.AUTHOR, SystemRole.CONTRIBUTOR]),
      );
    });
  });

  describe('resolveEffectiveRoles', () => {
    it('expands the user’s directly-assigned roles through the hierarchy', async () => {
      const { service, userRoleRepository } = buildService([SystemRole.EDITOR], []);
      const result = await service.resolveEffectiveRoles('user-1');
      expect(userRoleRepository.findRoleNamesForUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(
        expect.arrayContaining([SystemRole.EDITOR, SystemRole.AUTHOR, SystemRole.CONTRIBUTOR]),
      );
    });
  });

  describe('resolvePermissions', () => {
    it('queries permissions for every effective (direct + inherited) role', async () => {
      const { service, rolePermissionRepository } = buildService(
        [SystemRole.EDITOR],
        ['article.create', 'article.update'],
      );
      const result = await service.resolvePermissions('user-1');
      expect(rolePermissionRepository.findPermissionKeysForRoleNames).toHaveBeenCalledWith(
        expect.arrayContaining([SystemRole.EDITOR, SystemRole.AUTHOR, SystemRole.CONTRIBUTOR]),
      );
      expect(result).toEqual(['article.create', 'article.update']);
    });
  });

  describe('hasPermission / hasAnyPermission / hasAllPermissions', () => {
    it('hasPermission is true only when the resolved set contains it', async () => {
      const { service } = buildService([SystemRole.EDITOR], ['article.create']);
      await expect(service.hasPermission('user-1', 'article.create')).resolves.toBe(true);
      await expect(service.hasPermission('user-1', 'article.delete')).resolves.toBe(false);
    });

    it('hasAnyPermission is true if at least one permission matches', async () => {
      const { service } = buildService([SystemRole.EDITOR], ['article.create']);
      await expect(
        service.hasAnyPermission('user-1', ['article.delete', 'article.create']),
      ).resolves.toBe(true);
      await expect(service.hasAnyPermission('user-1', ['article.delete'])).resolves.toBe(false);
    });

    it('hasAllPermissions requires every permission to match', async () => {
      const { service } = buildService([SystemRole.EDITOR], ['article.create', 'article.update']);
      await expect(
        service.hasAllPermissions('user-1', ['article.create', 'article.update']),
      ).resolves.toBe(true);
      await expect(
        service.hasAllPermissions('user-1', ['article.create', 'article.delete']),
      ).resolves.toBe(false);
    });

    it('an empty permission list is trivially satisfied', async () => {
      const { service } = buildService([], []);
      await expect(service.hasAnyPermission('user-1', [])).resolves.toBe(true);
      await expect(service.hasAllPermissions('user-1', [])).resolves.toBe(true);
    });
  });

  describe('hasRole', () => {
    it('is true for a directly assigned role', async () => {
      const { service } = buildService([SystemRole.EDITOR], []);
      await expect(service.hasRole('user-1', SystemRole.EDITOR)).resolves.toBe(true);
    });

    it('is true for an inherited (lower) role', async () => {
      const { service } = buildService([SystemRole.EDITOR], []);
      await expect(service.hasRole('user-1', SystemRole.AUTHOR)).resolves.toBe(true);
    });

    it('is false for a role outside the effective set', async () => {
      const { service } = buildService([SystemRole.EDITOR], []);
      await expect(service.hasRole('user-1', SystemRole.SEO_MANAGER)).resolves.toBe(false);
    });
  });

  describe('can', () => {
    it('behaves as a permission check today (documented as a future policy-aware gate)', async () => {
      const { service } = buildService([SystemRole.EDITOR], ['article.publish']);
      await expect(service.can('user-1', 'article.publish')).resolves.toBe(true);
      await expect(service.can('user-1', 'article.delete')).resolves.toBe(false);
    });
  });
});
