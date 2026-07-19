import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentsTable } from './assignments-table';
import { useLayouts } from '../hooks/use-layouts';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';
import type { LayoutAssignment } from '../types/layout-assignment';

vi.mock('../hooks/use-layouts', () => ({ useLayouts: vi.fn() }));
vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({ useArticles: vi.fn() }));
vi.mock('@/features/categories', () => ({ useCategoryFlat: vi.fn() }));

function mockLookups() {
  vi.mocked(useLayouts).mockReturnValue({
    data: { data: [{ id: 'l1', name: 'Sidebar Left' }], meta: {} },
  } as never);
  vi.mocked(usePages).mockReturnValue({
    data: { data: [{ id: 'p1', title: 'About Us' }], meta: {} },
  } as never);
  vi.mocked(useArticles).mockReturnValue({ data: { data: [], meta: {} } } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({ data: [] } as never);
}

function makeAssignment(overrides: Partial<LayoutAssignment> = {}): LayoutAssignment {
  return {
    id: 'a1',
    layoutId: 'l1',
    contentType: 'PAGE',
    pageId: 'p1',
    articleId: null,
    categoryId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('AssignmentsTable', () => {
  it('resolves the layout id and target entity id to their real names', () => {
    mockLookups();
    render(<AssignmentsTable data={[makeAssignment()]} onUnassign={vi.fn()} />);
    expect(screen.getByText('Sidebar Left')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('shows "Default for every page" for a content-default assignment (no entity id)', () => {
    mockLookups();
    render(
      <AssignmentsTable
        data={[makeAssignment({ pageId: undefined as never })]}
        onUnassign={vi.fn()}
      />
    );
    expect(screen.getByText('Default for every page')).toBeInTheDocument();
  });

  it('shows "The homepage" for a HOMEPAGE assignment', () => {
    mockLookups();
    render(
      <AssignmentsTable
        data={[makeAssignment({ contentType: 'HOMEPAGE', pageId: null })]}
        onUnassign={vi.fn()}
      />
    );
    expect(screen.getByText('The homepage')).toBeInTheDocument();
  });

  it('calls onUnassign when the Unassign action is clicked', async () => {
    mockLookups();
    const onUnassign = vi.fn();
    const user = userEvent.setup();
    render(<AssignmentsTable data={[makeAssignment()]} onUnassign={onUnassign} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Unassign' }));
    expect(onUnassign).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('renders the empty state when there are no assignments', () => {
    mockLookups();
    render(<AssignmentsTable data={[]} onUnassign={vi.fn()} />);
    expect(screen.getByText('No layout assignments yet')).toBeInTheDocument();
  });
});
