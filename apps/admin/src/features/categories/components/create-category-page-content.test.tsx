import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateCategoryPageContent } from './create-category-page-content';
import { categoriesApi } from '../services/categories.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/categories.api', () => ({ categoriesApi: { create: vi.fn(), getFlat: vi.fn() } }));
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

describe('CreateCategoryPageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(categoriesApi.getFlat).mockResolvedValue([]);
    vi.mocked(categoriesApi.create).mockResolvedValue({ id: 'c1' } as never);
    const user = userEvent.setup();
    render(<CreateCategoryPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'News');
    await user.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() => expect(categoriesApi.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'News' })));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/categories/c1'));
  });
});
