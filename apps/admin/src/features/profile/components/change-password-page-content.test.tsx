import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ChangePasswordPageContent } from './change-password-page-content';
import { profileApi } from '../services/profile.api';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { ApiError } from '@/lib/api-error';

vi.mock('../services/profile.api', () => ({ profileApi: { changePassword: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(logoutMock = vi.fn().mockResolvedValue(undefined)) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const authValue: AuthContextValue = {
    user: { id: 'u1', email: 'jane@example.com', username: null, displayName: 'Jane Doe', status: 'ACTIVE' },
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: logoutMock,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('ChangePasswordPageContent', () => {
  it('renders the password form', () => {
    render(<ChangePasswordPageContent />, { wrapper: wrapper() });
    expect(screen.getByLabelText('Current password')).toBeInTheDocument();
  });

  it('submits and logs the user out on success', async () => {
    vi.mocked(profileApi.changePassword).mockResolvedValue({ message: 'Password changed. All sessions have been logged out.' });
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ChangePasswordPageContent />, { wrapper: wrapper(logoutMock) });

    await user.type(screen.getByLabelText('Current password'), 'old');
    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => expect(logoutMock).toHaveBeenCalled());
  });

  it('shows the backend error message on failure and does not log out', async () => {
    vi.mocked(profileApi.changePassword).mockRejectedValue(
      new ApiError({ message: 'Current password is incorrect.', code: 'AUTHENTICATION_UNAUTHORIZED', status: 401 }),
    );
    const logoutMock = vi.fn();
    const user = userEvent.setup();
    render(<ChangePasswordPageContent />, { wrapper: wrapper(logoutMock) });

    await user.type(screen.getByLabelText('Current password'), 'wrong');
    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => expect(screen.getByText('Current password is incorrect.')).toBeInTheDocument());
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
