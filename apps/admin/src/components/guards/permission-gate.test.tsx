import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PermissionGate } from './permission-gate';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

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

describe('PermissionGate', () => {
  it('renders children when the user has the single required permission', () => {
    render(<PermissionGate permissions={PERMISSIONS.ARTICLE_CREATE}>Allowed</PermissionGate>, {
      wrapper: wrapper([PERMISSIONS.ARTICLE_CREATE]),
    });
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  it('renders nothing (default fallback) when the user lacks the permission', () => {
    const { container } = render(
      <PermissionGate permissions={PERMISSIONS.ARTICLE_CREATE}>Allowed</PermissionGate>,
      {
        wrapper: wrapper([]),
      }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a custom fallback when denied', () => {
    render(
      <PermissionGate permissions={PERMISSIONS.ARTICLE_CREATE} fallback={<span>No access</span>}>
        Allowed
      </PermissionGate>,
      { wrapper: wrapper([]) }
    );
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('uses OR semantics by default across multiple permissions', () => {
    render(
      <PermissionGate permissions={[PERMISSIONS.ARTICLE_CREATE, PERMISSIONS.ARTICLE_DELETE]}>
        Allowed
      </PermissionGate>,
      { wrapper: wrapper([PERMISSIONS.ARTICLE_DELETE]) }
    );
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  it('uses AND semantics when requireAll is true', () => {
    const { container } = render(
      <PermissionGate
        permissions={[PERMISSIONS.ARTICLE_CREATE, PERMISSIONS.ARTICLE_DELETE]}
        requireAll
      >
        Allowed
      </PermissionGate>,
      { wrapper: wrapper([PERMISSIONS.ARTICLE_DELETE]) }
    );
    expect(container).toBeEmptyDOMElement();
  });
});
