import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useFilteredNavigation } from './use-filtered-navigation';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

function makeWrapper(permissions: string[]) {
  const value: PermissionContextValue = {
    permissions,
    roles: [],
    can: (p) => permissions.includes(p),
    canAny: (required) => required.length === 0 || required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
  };
}

describe('useFilteredNavigation', () => {
  it('includes items with no permission requirement for a user with zero permissions', () => {
    const { result } = renderHook(() => useFilteredNavigation(), { wrapper: makeWrapper([]) });
    const rootGroup = result.current.find((group) => group.id === 'root');
    expect(rootGroup).toBeUndefined();

    const communityGroup = result.current.find((group) => group.id === 'community');
    expect(communityGroup?.items.map((item) => item.id)).toContain('comments');
  });

  it('includes a permission-gated item when the user holds that permission', () => {
    const { result } = renderHook(() => useFilteredNavigation(), {
      wrapper: makeWrapper([PERMISSIONS.DASHBOARD_VIEW]),
    });
    const rootGroup = result.current.find((group) => group.id === 'root');
    expect(rootGroup?.items.map((item) => item.id)).toContain('dashboard');
  });

  it('drops an entire group once every one of its items is filtered out', () => {
    const { result } = renderHook(() => useFilteredNavigation(), { wrapper: makeWrapper([]) });
    const administrationGroup = result.current.find((group) => group.id === 'administration');
    expect(administrationGroup).toBeUndefined();
  });

  it('shows all administration items for a fully-permissioned user', () => {
    const allAdminPermissions = [
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.ROLES_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
    ];
    const { result } = renderHook(() => useFilteredNavigation(), {
      wrapper: makeWrapper(allAdminPermissions),
    });
    const administrationGroup = result.current.find((group) => group.id === 'administration');
    expect(administrationGroup?.items).toHaveLength(3);
  });
});
