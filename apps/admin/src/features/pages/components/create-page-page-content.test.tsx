import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreatePagePageContent } from './create-page-page-content';
import { pagesApi } from '../services/pages.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/pages.api', () => ({ pagesApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('CreatePagePageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(pagesApi.create).mockResolvedValue({ id: 'p1' } as never);
    const user = userEvent.setup();
    render(<CreatePagePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Title'), 'About Us');
    await user.type(screen.getByLabelText(/Content/), 'Some body text');
    await user.click(screen.getByRole('button', { name: 'Create page' }));

    await waitFor(() =>
      expect(pagesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'About Us', body: { text: 'Some body text' } })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/pages/p1'));
  });
});
