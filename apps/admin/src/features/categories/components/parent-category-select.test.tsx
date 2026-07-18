import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentCategorySelect } from './parent-category-select';
import { useCategoryFlat } from '../hooks/use-category-flat';

vi.mock('../hooks/use-category-flat', () => ({ useCategoryFlat: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

const categories = [
  { id: 'c1', name: 'News', slug: 'news', parentId: null },
  { id: 'c2', name: 'Sports', slug: 'sports', parentId: null },
];

describe('ParentCategorySelect', () => {
  it('lists the fetched categories and calls onChange when one is picked', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: categories, isError: false } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ParentCategorySelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Sports' }));
    expect(onChange).toHaveBeenCalledWith('c2');
  });

  it('excludes ids in excludeIds (self/descendants)', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: categories, isError: false } as never);
    const user = userEvent.setup();
    render(<ParentCategorySelect value="" onChange={vi.fn()} excludeIds={['c2']} />);

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'News' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Sports' })).not.toBeInTheDocument();
  });

  it('shows a permission message instead of the selector when the query errors', () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: undefined, isError: true } as never);
    render(<ParentCategorySelect value="" onChange={vi.fn()} />);
    expect(screen.getByText("You don't have permission to view categories.")).toBeInTheDocument();
  });
});
