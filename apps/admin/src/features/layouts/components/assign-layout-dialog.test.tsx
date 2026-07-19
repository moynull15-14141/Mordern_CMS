import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignLayoutDialog } from './assign-layout-dialog';
import { useAssignLayout } from '../hooks/use-assign-layout';
import { useLayouts } from '../hooks/use-layouts';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';

vi.mock('../hooks/use-assign-layout', () => ({ useAssignLayout: vi.fn() }));
vi.mock('../hooks/use-layouts', () => ({ useLayouts: vi.fn() }));
vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({ useArticles: vi.fn() }));
vi.mock('@/features/categories', () => ({ useCategoryFlat: vi.fn() }));

function mockQueries() {
  vi.mocked(useLayouts).mockReturnValue({
    data: { data: [{ id: 'l1', name: 'Sidebar Left' }], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(usePages).mockReturnValue({
    data: { data: [{ id: 'p1', title: 'About Us', slug: 'about-us' }], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useArticles).mockReturnValue({
    data: { data: [], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isLoading: false } as never);
}

describe('AssignLayoutDialog', () => {
  it('shows the Layout select when no layoutId is preselected', () => {
    mockQueries();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('hides the Layout select when a layoutId is preselected', () => {
    mockQueries();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} layoutId="l1" />);
    expect(screen.queryByText('Layout')).not.toBeInTheDocument();
  });

  it('disables Assign until a layout and a target are both chosen', async () => {
    mockQueries();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Assign' })).toBeDisabled();
  });

  it('assigns to the homepage once a layout is chosen (no target picker needed)', async () => {
    mockQueries();
    const mutate = vi.fn();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} layoutId="l1" />);

    await user.click(screen.getByRole('tab', { name: 'Homepage' }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    expect(mutate).toHaveBeenCalledWith(
      { layoutId: 'l1', contentType: 'HOMEPAGE' },
      expect.anything()
    );
  });

  it('assigns as a content-type-wide default when "Use as the default" is clicked', async () => {
    mockQueries();
    const mutate = vi.fn();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} layoutId="l1" />);

    await user.click(screen.getByRole('button', { name: 'Use as the default for every page' }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    expect(mutate).toHaveBeenCalledWith({ layoutId: 'l1', contentType: 'PAGE' }, expect.anything());
  });

  it('assigns to a specific page when one is selected from the picker', async () => {
    mockQueries();
    const mutate = vi.fn();
    vi.mocked(useAssignLayout).mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();
    render(<AssignLayoutDialog open onOpenChange={vi.fn()} layoutId="l1" />);

    await user.click(screen.getByText('About Us'));
    expect(screen.getByText(/Selected:/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Assign' }));
    expect(mutate).toHaveBeenCalledWith(
      { layoutId: 'l1', contentType: 'PAGE', pageId: 'p1' },
      expect.anything()
    );
  });
});
