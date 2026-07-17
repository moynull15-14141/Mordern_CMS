import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PermissionRoute } from './permission-route';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function wrapper(permissions: string[]) {
  const value: PermissionContextValue = {
    permissions,
    roles: [],
    can: (p) => permissions.includes(p),
    canAny: (required) => required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
  };
}

describe('PermissionRoute', () => {
  it('renders children when the user holds the required permission', () => {
    render(
      <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
        <div>Users list</div>
      </PermissionRoute>,
      { wrapper: wrapper([PERMISSIONS.USERS_MANAGE]) }
    );
    expect(screen.getByText('Users list')).toBeInTheDocument();
  });

  it('redirects to /403 and does not render children when the permission is missing', () => {
    replaceMock.mockClear();
    render(
      <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
        <div>Users list</div>
      </PermissionRoute>,
      { wrapper: wrapper([]) }
    );
    expect(replaceMock).toHaveBeenCalledWith('/403');
    expect(screen.queryByText('Users list')).not.toBeInTheDocument();
  });

  it('uses OR semantics by default across multiple permissions', () => {
    render(
      <PermissionRoute permissions={[PERMISSIONS.ARTICLE_CREATE, PERMISSIONS.ARTICLE_DELETE]}>
        <div>Articles</div>
      </PermissionRoute>,
      { wrapper: wrapper([PERMISSIONS.ARTICLE_DELETE]) }
    );
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('uses AND semantics when requireAll is true', () => {
    replaceMock.mockClear();
    render(
      <PermissionRoute
        permissions={[PERMISSIONS.ARTICLE_CREATE, PERMISSIONS.ARTICLE_DELETE]}
        requireAll
      >
        <div>Articles</div>
      </PermissionRoute>,
      { wrapper: wrapper([PERMISSIONS.ARTICLE_DELETE]) }
    );
    expect(replaceMock).toHaveBeenCalledWith('/403');
    expect(screen.queryByText('Articles')).not.toBeInTheDocument();
  });
});
