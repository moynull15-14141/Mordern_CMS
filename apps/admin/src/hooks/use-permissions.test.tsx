import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { usePermissions } from './use-permissions';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const mockValue: PermissionContextValue = {
  permissions: ['article.create', 'article.update'],
  roles: ['Editor'],
  can: (permission) => mockValue.permissions.includes(permission),
  canAny: (required) => required.some((p) => mockValue.permissions.includes(p)),
  canAll: (required) => required.every((p) => mockValue.permissions.includes(p)),
  isRole: (role) => mockValue.roles.includes(role),
};

function wrapper({ children }: { children: ReactNode }) {
  return <PermissionContext.Provider value={mockValue}>{children}</PermissionContext.Provider>;
}

describe('usePermissions', () => {
  it('returns the PermissionContext value when used within a PermissionProvider', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    expect(result.current.can('article.create')).toBe(true);
    expect(result.current.can('article.delete')).toBe(false);
  });

  it('throws when used outside a PermissionProvider', () => {
    expect(() => renderHook(() => usePermissions())).toThrow(
      'usePermissions() must be used within a <PermissionProvider>.'
    );
  });
});
