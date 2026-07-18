import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditTagPageContent } from './edit-tag-page-content';
import { tagsApi } from '../services/tags.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/tags.api', () => ({ tagsApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const targetTag = {
  id: 't1',
  name: 'Breaking',
  slug: 'breaking',
  description: null,
  synonyms: null,
  usageCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditTagPageContent', () => {
  it('loads the tag by id and pre-fills the form', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue(targetTag);
    render(<EditTagPageContent tagId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Breaking'));
    expect(tagsApi.get).toHaveBeenCalledWith('t1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue(targetTag);
    vi.mocked(tagsApi.update).mockResolvedValue({ ...targetTag, name: 'Urgent' });
    const user = userEvent.setup();
    render(<EditTagPageContent tagId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Urgent');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(tagsApi.update).toHaveBeenCalledWith('t1', expect.objectContaining({ name: 'Urgent' })));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/tags/t1'));
  });
});
