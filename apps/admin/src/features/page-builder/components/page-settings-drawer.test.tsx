import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PageSettingsDrawer } from './page-settings-drawer';
import { pagesApi } from '@/features/pages/services/pages.api';
import type { Page } from '@/features/pages/types/page';

vi.mock('@/features/pages/services/pages.api', () => ({ pagesApi: { update: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const page: Page = {
  id: 'page-1',
  title: 'About',
  slug: 'about',
  body: { blocks: [] },
  status: 'DRAFT',
  publishedAt: null,
  seo: null,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PageSettingsDrawer', () => {
  it('saves title/slug/status changes without touching body', async () => {
    vi.mocked(pagesApi.update).mockResolvedValue(page);
    const onOpenChange = vi.fn();
    render(<PageSettingsDrawer open onOpenChange={onOpenChange} page={page} />, {
      wrapper: wrapper(),
    });

    const titleInput = screen.getByLabelText('Title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New Title');
    await userEvent.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() =>
      expect(pagesApi.update).toHaveBeenCalledWith('page-1', {
        title: 'New Title',
        slug: 'about',
        status: 'DRAFT',
        seo: undefined,
      })
    );
    const [, input] = vi.mocked(pagesApi.update).mock.calls[0];
    expect(input).not.toHaveProperty('body');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
