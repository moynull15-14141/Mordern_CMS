import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditProfilePageContent } from './edit-profile-page-content';
import { profileApi } from '../services/profile.api';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

vi.mock('../services/profile.api', () => ({
  profileApi: { getMe: vi.fn(), updateProfile: vi.fn(), updatePreferences: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const authValue: AuthContextValue = {
    user: { id: 'u1', email: 'jane@example.com', username: null, displayName: 'Jane Doe', status: 'ACTIVE' },
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

const profile = {
  id: 'u1',
  email: 'jane@example.com',
  username: 'jdoe',
  displayName: 'Jane Doe',
  status: 'ACTIVE' as const,
  profileImageId: null,
  lastLoginAt: null,
  locked: false,
  profile: { firstName: 'Jane', lastName: 'Doe' },
  preferences: { theme: 'DARK' as const },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditProfilePageContent', () => {
  it('renders both a Profile card and a Preferences card', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    render(<EditProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('pre-fills the profile form from the loaded profile', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    render(<EditProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('First name')).toHaveValue('Jane'));
  });

  it('submits the profile form independently of the preferences form', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    vi.mocked(profileApi.updateProfile).mockResolvedValue(profile);
    const user = userEvent.setup();
    render(<EditProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('First name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('First name'));
    await user.type(screen.getByLabelText('First name'), 'Janet');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(profileApi.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Janet' })));
    expect(profileApi.updatePreferences).not.toHaveBeenCalled();
  });

  it('submits the preferences form independently of the profile form', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    vi.mocked(profileApi.updatePreferences).mockResolvedValue(profile);
    const user = userEvent.setup();
    render(<EditProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Save preferences' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    await waitFor(() => expect(profileApi.updatePreferences).toHaveBeenCalled());
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });
});
