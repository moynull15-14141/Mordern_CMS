import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditCategoryPageContent } from './edit-category-page-content';
import { categoriesApi } from '../services/categories.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/categories.api', () => ({ categoriesApi: { get: vi.fn(), update: vi.fn() } }));
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

const targetCategory = {
  id: 'c1',
  name: 'News',
  slug: 'news',
  description: null,
  status: 'ACTIVE' as const,
  parentId: null,
  sortOrder: 1,
  articleCount: 0,
  childrenCount: 0,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditCategoryPageContent', () => {
  it('loads the category by id and pre-fills the form', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(targetCategory);
    render(<EditCategoryPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('News'));
    expect(categoriesApi.get).toHaveBeenCalledWith('c1');
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(targetCategory);
    const user = userEvent.setup();
    render(<EditCategoryPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Name'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(targetCategory);
    vi.mocked(categoriesApi.update).mockResolvedValue({ ...targetCategory, name: 'Sports' });
    const user = userEvent.setup();
    render(<EditCategoryPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Sports');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(categoriesApi.update).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Sports' })),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/categories/c1'));
  });
});
