import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RoleGate } from './role-gate';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

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

describe('RoleGate', () => {
  it('renders children when the user holds the required role', () => {
    render(<RoleGate roles="Administrator">Allowed</RoleGate>, {
      wrapper: wrapper(['Administrator']),
    });
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  it('renders nothing by default when the role is missing', () => {
    const { container } = render(<RoleGate roles="Administrator">Allowed</RoleGate>, {
      wrapper: wrapper(['Editor']),
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a custom fallback when denied', () => {
    render(
      <RoleGate roles="Administrator" fallback={<span>No access</span>}>
        Allowed
      </RoleGate>,
      { wrapper: wrapper(['Editor']) }
    );
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('uses OR semantics across multiple roles', () => {
    render(<RoleGate roles={['Administrator', 'Editor']}>Allowed</RoleGate>, {
      wrapper: wrapper(['Editor']),
    });
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });
});
