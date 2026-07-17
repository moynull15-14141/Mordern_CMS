import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { QuickActions } from './quick-actions';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));
import { toast as sonnerToast } from 'sonner';

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

describe('QuickActions', () => {
  it('only renders actions the user has permission for', () => {
    render(<QuickActions />, { wrapper: wrapper([PERMISSIONS.ARTICLE_CREATE]) });
    expect(screen.getByRole('button', { name: /New Article/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New Category/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New User/ })).not.toBeInTheDocument();
  });

  it('renders no actions for a user with none of the relevant permissions', () => {
    render(<QuickActions />, { wrapper: wrapper([]) });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a "Coming soon" toast when an action is clicked, without navigating anywhere', async () => {
    const user = userEvent.setup();
    render(<QuickActions />, { wrapper: wrapper([PERMISSIONS.ARTICLE_CREATE]) });

    await user.click(screen.getByRole('button', { name: /New Article/ }));

    expect(sonnerToast.info).toHaveBeenCalledWith('Coming soon', {
      description: "New Article isn't available yet.",
    });
  });
});
