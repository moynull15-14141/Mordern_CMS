import { Injectable } from '@nestjs/common';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { resolveRoleHierarchy } from '../utils/resolve-role-hierarchy.util';

/**
 * The single source of truth for "can this user do X" (per the milestone's
 * architecture goal: Identity -> Authentication -> Authorization -> Business
 * Modules). Business modules must never compute permissions themselves —
 * only ever call this service.
 *
 * No caching yet (AuthorizationCacheProvider is an interface only, Milestone
 * 5 §Permission Cache) — every call re-queries the database.
 */
@Injectable()
export class AuthorizationService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  /** Expands a set of directly-assigned role names through the frozen hierarchy. */
  resolveInheritedRoles(roleNames: readonly string[]): string[] {
    return resolveRoleHierarchy(roleNames);
  }

  /** All roles (direct + inherited) a user effectively holds. */
  async resolveEffectiveRoles(userId: string): Promise<string[]> {
    const directRoles = await this.userRoleRepository.findRoleNamesForUser(userId);
    return this.resolveInheritedRoles(directRoles);
  }

  /** All `resource.action` permission keys granted to a user, across every
   * role they hold directly or through inheritance. */
  async resolvePermissions(userId: string): Promise<string[]> {
    const effectiveRoles = await this.resolveEffectiveRoles(userId);
    return this.rolePermissionRepository.findPermissionKeysForRoleNames(effectiveRoles);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const granted = await this.resolvePermissions(userId);
    return granted.includes(permission);
  }

  async hasAnyPermission(userId: string, permissions: readonly string[]): Promise<boolean> {
    if (permissions.length === 0) {
      return true;
    }
    const granted = await this.resolvePermissions(userId);
    return permissions.some((permission) => granted.includes(permission));
  }

  async hasAllPermissions(userId: string, permissions: readonly string[]): Promise<boolean> {
    if (permissions.length === 0) {
      return true;
    }
    const granted = await this.resolvePermissions(userId);
    return permissions.every((permission) => granted.includes(permission));
  }

  /** True if the user holds `roleName` directly or through inheritance
   * (e.g. a Super Admin passes hasRole('Editor') too). */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const effectiveRoles = await this.resolveEffectiveRoles(userId);
    return effectiveRoles.includes(roleName);
  }

  /**
   * Generic authorization gate. Today this is a plain permission check;
   * kept as its own method (rather than an alias) so a future policy-aware
   * check — e.g. `can(userId, 'update', article)` consulting an
   * ArticlePolicy — can replace the implementation without changing the
   * public API business modules depend on.
   */
  async can(userId: string, permission: string): Promise<boolean> {
    return this.hasPermission(userId, permission);
  }
}
