import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleFilters } from './article-filters';
import { useCategoryOptions } from '../hooks/use-category-options';
import { useTagOptions } from '../hooks/use-tag-options';

vi.mock('../hooks/use-category-options', () => ({ useCategoryOptions: vi.fn() }));
vi.mock('../hooks/use-tag-options', () => ({ useTagOptions: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

function mockOptionsLoaded() {
  vi.mocked(useCategoryOptions).mockReturnValue({
    data: [{ id: 'c1', name: 'News', slug: 'news', parentId: null }],
  } as never);
  vi.mocked(useTagOptions).mockReturnValue({
    data: { data: [{ id: 't1', name: 'Breaking', slug: 'breaking' }], meta: {} },
  } as never);
}

describe('ArticleFilters', () => {
  it('renders Status, Visibility, Category, Tag, and Author id controls', () => {
    mockOptionsLoaded();
    render(<ArticleFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Visibility')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Tag')).toBeInTheDocument();
    expect(screen.getByLabelText('Author id')).toBeInTheDocument();
  });

  it('falls back to a plain text input for Category/Tag while options are loading', () => {
    vi.mocked(useCategoryOptions).mockReturnValue({ data: undefined } as never);
    vi.mocked(useTagOptions).mockReturnValue({ data: undefined } as never);
    render(<ArticleFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Category id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tag id')).toBeInTheDocument();
  });

  it('does not render a "Clear filters" button when nothing is active', () => {
    mockOptionsLoaded();
    render(<ArticleFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows "Clear filters" once a filter is active, and clears on click', async () => {
    mockOptionsLoaded();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ArticleFilters value={{ status: 'DRAFT' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('selecting a status calls onChange with that status', async () => {
    mockOptionsLoaded();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ArticleFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Published' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'PUBLISHED' });
  });

  it('typing an author id calls onChange with that value', async () => {
    mockOptionsLoaded();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ArticleFilters value={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('Author id'), 'x');
    expect(onChange).toHaveBeenLastCalledWith({ authorId: 'x' });
  });
});
