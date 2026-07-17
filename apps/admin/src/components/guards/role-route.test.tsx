import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RoleRoute } from './role-route';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function wrapper(roles: string[]) {
  const value: PermissionContextValue = {
    permissions: [],
    roles,
    can: () => false,
    canAny: () => false,
    canAll: () => false,
    isRole: (role) => roles.includes(role),
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
  };
}

describe('RoleRoute', () => {
  it('renders children when the user holds the required role', () => {
    render(
      <RoleRoute roles="Administrator">
        <div>Admin area</div>
      </RoleRoute>,
      { wrapper: wrapper(['Administrator']) }
    );
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  it('redirects to /403 and does not render children when the role is missing', () => {
    replaceMock.mockClear();
    render(
      <RoleRoute roles="Administrator">
        <div>Admin area</div>
      </RoleRoute>,
      { wrapper: wrapper(['Editor']) }
    );
    expect(replaceMock).toHaveBeenCalledWith('/403');
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });

  it('uses OR semantics across multiple roles', () => {
    render(
      <RoleRoute roles={['Administrator', 'Editor']}>
        <div>Admin area</div>
      </RoleRoute>,
      { wrapper: wrapper(['Editor']) }
    );
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });
});
