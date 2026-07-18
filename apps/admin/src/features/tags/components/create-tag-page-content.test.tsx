import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateTagPageContent } from './create-tag-page-content';
import { tagsApi } from '../services/tags.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/tags.api', () => ({ tagsApi: { create: vi.fn() } }));
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

describe('CreateTagPageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(tagsApi.create).mockResolvedValue({ id: 't1' } as never);
    const user = userEvent.setup();
    render(<CreateTagPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Breaking');
    await user.click(screen.getByRole('button', { name: 'Create tag' }));

    await waitFor(() => expect(tagsApi.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Breaking' })));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/tags/t1'));
  });
});
