import { SystemRole } from '../interfaces/system-role.enum';
import { resolveRoleHierarchy } from './resolve-role-hierarchy.util';

describe('resolveRoleHierarchy', () => {
  it('expands the frozen chain: Super Admin inherits Administrator, Editor, Author, Contributor', () => {
    const result = resolveRoleHierarchy([SystemRole.SUPER_ADMIN]);
    expect(result).toEqual(
      expect.arrayContaining([
        SystemRole.SUPER_ADMIN,
        SystemRole.ADMINISTRATOR,
        SystemRole.EDITOR,
        SystemRole.AUTHOR,
        SystemRole.CONTRIBUTOR,
      ]),
    );
    expect(result).toHaveLength(5);
  });

  it('expands a mid-chain role to only itself and its descendants', () => {
    const result = resolveRoleHierarchy([SystemRole.EDITOR]);
    expect(result.sort()).toEqual(
      [SystemRole.EDITOR, SystemRole.AUTHOR, SystemRole.CONTRIBUTOR].sort(),
    );
  });

  it('leaves a standalone role (no inheritance) as just itself', () => {
    expect(resolveRoleHierarchy([SystemRole.MODERATOR])).toEqual([SystemRole.MODERATOR]);
    expect(resolveRoleHierarchy([SystemRole.SEO_MANAGER])).toEqual([SystemRole.SEO_MANAGER]);
    expect(resolveRoleHierarchy([SystemRole.GUEST])).toEqual([SystemRole.GUEST]);
  });

  it('never duplicates a role reachable through multiple assigned roles', () => {
    const result = resolveRoleHierarchy([SystemRole.EDITOR, SystemRole.AUTHOR]);
    const authorCount = result.filter((role) => role === SystemRole.AUTHOR).length;
    expect(authorCount).toBe(1);
  });

  it('returns an empty array for an empty input', () => {
    expect(resolveRoleHierarchy([])).toEqual([]);
  });

  it('treats an unknown role name as a standalone leaf', () => {
    expect(resolveRoleHierarchy(['Some Custom Role'])).toEqual(['Some Custom Role']);
  });
});
