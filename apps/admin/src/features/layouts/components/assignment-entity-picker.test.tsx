import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentEntityPicker } from './assignment-entity-picker';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';

vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({ useArticles: vi.fn() }));
vi.mock('@/features/categories', () => ({ useCategoryFlat: vi.fn() }));

function mockAll() {
  vi.mocked(usePages).mockReturnValue({
    data: { data: [{ id: 'p1', title: 'About Us', slug: 'about-us' }], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useArticles).mockReturnValue({
    data: { data: [{ id: 'a1', title: 'Match Report', slug: 'match-report' }], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({
    data: [{ id: 'c1', name: 'Football', slug: 'football' }],
    isLoading: false,
  } as never);
}

describe('AssignmentEntityPicker', () => {
  it('lists real pages when contentType is PAGE', () => {
    mockAll();
    render(<AssignmentEntityPicker contentType="PAGE" onSelect={vi.fn()} />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.queryByText('Match Report')).not.toBeInTheDocument();
  });

  it('lists real articles when contentType is ARTICLE', () => {
    mockAll();
    render(<AssignmentEntityPicker contentType="ARTICLE" onSelect={vi.fn()} />);
    expect(screen.getByText('Match Report')).toBeInTheDocument();
  });

  it('lists real categories when contentType is CATEGORY, filtered by search', () => {
    mockAll();
    render(<AssignmentEntityPicker contentType="CATEGORY" onSelect={vi.fn()} />);
    expect(screen.getByText('Football')).toBeInTheDocument();
  });

  it('calls onSelect with the entity id and label when a row is clicked', async () => {
    mockAll();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AssignmentEntityPicker contentType="PAGE" onSelect={onSelect} />);

    await user.click(screen.getByText('About Us'));
    expect(onSelect).toHaveBeenCalledWith('p1', 'About Us');
  });

  it('shows an empty state when no results match', () => {
    vi.mocked(usePages).mockReturnValue({
      data: { data: [], meta: {} },
      isLoading: false,
    } as never);
    render(<AssignmentEntityPicker contentType="PAGE" onSelect={vi.fn()} />);
    expect(screen.getByText('No pages found')).toBeInTheDocument();
  });
});
