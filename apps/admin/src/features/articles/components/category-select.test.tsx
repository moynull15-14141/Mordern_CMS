import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelect } from './category-select';
import { useCategoryOptions } from '../hooks/use-category-options';

vi.mock('../hooks/use-category-options', () => ({ useCategoryOptions: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('CategorySelect', () => {
  it('lists the fetched categories and calls onChange when one is picked', async () => {
    vi.mocked(useCategoryOptions).mockReturnValue({
      data: [{ id: 'c1', name: 'News', slug: 'news', parentId: null }],
      isError: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategorySelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'News' }));

    expect(onChange).toHaveBeenCalledWith('c1');
  });

  it('shows a permission message instead of the selector when the query errors', () => {
    vi.mocked(useCategoryOptions).mockReturnValue({ data: undefined, isError: true } as never);
    render(<CategorySelect value="" onChange={vi.fn()} />);
    expect(screen.getByText("You don't have permission to view categories.")).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
