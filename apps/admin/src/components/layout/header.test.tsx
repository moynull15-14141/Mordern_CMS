import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Header } from './header';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { useUiStore } from '@/stores/ui-store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

const logoutMock = vi.fn().mockResolvedValue(undefined);

function wrapper(overrides: Partial<AuthContextValue> = {}) {
  const authValue: AuthContextValue = {
    user: { id: '1', email: 'a@b.com', username: null, displayName: 'Alex User', status: 'ACTIVE' },
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: logoutMock,
    ...overrides,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider attribute="class">
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </ThemeProvider>
    );
  };
}

afterEach(() => {
  useUiStore.setState({ mobileDrawerOpen: false });
  logoutMock.mockClear();
});

describe('Header', () => {
  it('renders the mobile drawer trigger', () => {
    render(<Header />, { wrapper: wrapper() });
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('opens the mobile drawer when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />, { wrapper: wrapper() });
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(useUiStore.getState().mobileDrawerOpen).toBe(true);
  });

  it("shows the user's display name", () => {
    render(<Header />, { wrapper: wrapper() });
    expect(screen.getByText('Alex User')).toBeInTheDocument();
  });

  it('falls back to email when displayName is null', () => {
    render(<Header />, {
      wrapper: wrapper({
        user: { id: '1', email: 'a@b.com', username: null, displayName: null, status: 'ACTIVE' },
      }),
    });
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
  });

  it('opens the user menu and shows a Profile link and Log out item', async () => {
    const user = userEvent.setup();
    render(<Header />, { wrapper: wrapper() });

    await user.click(screen.getByRole('button', { name: /Alex User/ }));

    expect(screen.getByRole('menuitem', { name: /Profile/ })).toHaveAttribute('href', '/profile');
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('calls useAuth().logout() when "Log out" is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />, { wrapper: wrapper() });

    await user.click(screen.getByRole('button', { name: /Alex User/ }));
    await user.click(screen.getByText('Log out'));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('opens the theme menu with Light/Dark/System options', async () => {
    const user = userEvent.setup();
    render(<Header />, { wrapper: wrapper() });

    await user.click(screen.getByRole('button', { name: 'Change theme' }));

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });
});
