import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoveCategoryDialog } from './move-category-dialog';
import { useCategoryFlat } from '../hooks/use-category-flat';
import { useCategoryDescendants } from '../hooks/use-category-descendants';

vi.mock('../hooks/use-category-flat', () => ({ useCategoryFlat: vi.fn() }));
vi.mock('../hooks/use-category-descendants', () => ({ useCategoryDescendants: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

const categories = [
  { id: 'c1', name: 'News', slug: 'news', parentId: null },
  { id: 'c2', name: 'Sports', slug: 'sports', parentId: null },
];

describe('MoveCategoryDialog', () => {
  it('excludes the category itself and its descendants from the parent options', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: categories, isError: false } as never);
    vi.mocked(useCategoryDescendants).mockReturnValue({ data: [] } as never);
    const user = userEvent.setup();
    render(
      <MoveCategoryDialog
        open
        onOpenChange={vi.fn()}
        categoryId="c1"
        categoryName="News"
        currentParentId={null}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Sports' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'News' })).not.toBeInTheDocument();
  });

  it('submits the selected parentId', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: categories, isError: false } as never);
    vi.mocked(useCategoryDescendants).mockReturnValue({ data: [] } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <MoveCategoryDialog
        open
        onOpenChange={vi.fn()}
        categoryId="c1"
        categoryName="News"
        currentParentId={null}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Sports' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ parentId: 'c2' }));
  });

  it('submits null parentId when "No parent" is selected', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: categories, isError: false } as never);
    vi.mocked(useCategoryDescendants).mockReturnValue({ data: [] } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <MoveCategoryDialog
        open
        onOpenChange={vi.fn()}
        categoryId="c1"
        categoryName="News"
        currentParentId="c2"
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'No parent (root level)' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ parentId: null }));
  });
});
