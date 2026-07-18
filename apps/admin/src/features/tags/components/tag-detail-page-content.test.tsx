import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { TagDetailPageContent } from './tag-detail-page-content';
import { tagsApi } from '../services/tags.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/tags.api', () => ({ tagsApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['category.create']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const permissionValue: PermissionContextValue = {
    permissions,
    roles: [],
    can: (p) => permissions.includes(p),
    canAny: (required) => required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </QueryClientProvider>
    );
  };
}

const tag = {
  id: 't1',
  name: 'Breaking',
  slug: 'breaking',
  description: 'Urgent news',
  synonyms: ['urgent'],
  usageCount: 4,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('TagDetailPageContent', () => {
  it('renders tag metadata', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue(tag);
    render(<TagDetailPageContent tagId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Breaking').length).toBeGreaterThan(0));
    expect(screen.getByText('Urgent news')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('navigates to edit when Edit is clicked', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue(tag);
    const user = userEvent.setup();
    render(<TagDetailPageContent tagId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/tags/t1/edit');
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted tag', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue({ ...tag, deletedAt: '2026-01-05T00:00:00.000Z' });
    render(<TagDetailPageContent tagId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
