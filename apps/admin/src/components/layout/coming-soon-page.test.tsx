import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ComingSoonPage } from './coming-soon-page';
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
    canAny: (required) => required.length === 0 || required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
  };
}

describe('ComingSoonPage', () => {
  it('renders the page header and ComingSoon content when no permission is required', () => {
    render(<ComingSoonPage title="Comments" />, { wrapper: wrapper([]) });
    expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument();
    expect(screen.getByText("Comments isn't available yet")).toBeInTheDocument();
  });

  it('renders content when the required permission is held', () => {
    render(<ComingSoonPage title="Users" permissions={PERMISSIONS.USERS_MANAGE} />, {
      wrapper: wrapper([PERMISSIONS.USERS_MANAGE]),
    });
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });

  it('redirects to /403 when the required permission is missing', () => {
    replaceMock.mockClear();
    render(<ComingSoonPage title="Users" permissions={PERMISSIONS.USERS_MANAGE} />, {
      wrapper: wrapper([]),
    });
    expect(replaceMock).toHaveBeenCalledWith('/403');
    expect(screen.queryByRole('heading', { name: 'Users' })).not.toBeInTheDocument();
  });
});
