import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import ArticlesPage from './page';
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

describe('ArticlesPage', () => {
  it('renders the Coming Soon state for a user holding any relevant permission', () => {
    render(<ArticlesPage />, { wrapper: wrapper([PERMISSIONS.ARTICLE_CREATE]) });
    expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
    expect(screen.getByText("Articles isn't available yet")).toBeInTheDocument();
  });

  it('redirects to /403 for a user with none of the article permissions', () => {
    replaceMock.mockClear();
    render(<ArticlesPage />, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
