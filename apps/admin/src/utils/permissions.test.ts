import { describe, expect, it } from 'vitest';
import { hasAllPermissions, hasAnyPermission, hasPermission, hasRole } from './permissions';
import { PERMISSIONS } from '@/constants/permissions';

const { ARTICLE_CREATE, ARTICLE_DELETE, ARTICLE_UPDATE } = PERMISSIONS;

describe('hasPermission', () => {
  it('returns true when the permission is granted', () => {
    expect(hasPermission([ARTICLE_CREATE, ARTICLE_UPDATE], ARTICLE_CREATE)).toBe(true);
  });

  it('returns false when the permission is not granted', () => {
    expect(hasPermission([ARTICLE_UPDATE], ARTICLE_CREATE)).toBe(false);
  });
});

describe('hasAnyPermission (OR)', () => {
  it('returns true if at least one required permission is granted', () => {
    expect(hasAnyPermission([ARTICLE_UPDATE], [ARTICLE_CREATE, ARTICLE_UPDATE])).toBe(true);
  });

  it('returns false if none are granted', () => {
    expect(hasAnyPermission([ARTICLE_UPDATE], [ARTICLE_CREATE, ARTICLE_DELETE])).toBe(false);
  });

  it('returns true (vacuously) for an empty required list', () => {
    expect(hasAnyPermission([], [])).toBe(true);
  });
});

describe('hasAllPermissions (AND)', () => {
  it('returns true only if every required permission is granted', () => {
    expect(
      hasAllPermissions(
        [ARTICLE_CREATE, ARTICLE_UPDATE, ARTICLE_DELETE],
        [ARTICLE_CREATE, ARTICLE_UPDATE]
      )
    ).toBe(true);
  });

  it('returns false if any required permission is missing', () => {
    expect(hasAllPermissions([ARTICLE_CREATE], [ARTICLE_CREATE, ARTICLE_UPDATE])).toBe(false);
  });

  it('returns true (vacuously) for an empty required list', () => {
    expect(hasAllPermissions([], [])).toBe(true);
  });
});

describe('hasRole', () => {
  it('returns true when the role is present', () => {
    expect(hasRole(['Administrator', 'Editor'], 'Administrator')).toBe(true);
  });

  it('returns false when the role is absent', () => {
    expect(hasRole(['Editor'], 'Administrator')).toBe(false);
  });
});
