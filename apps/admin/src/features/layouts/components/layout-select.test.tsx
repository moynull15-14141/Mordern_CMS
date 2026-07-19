import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutSelect } from './layout-select';
import { useLayouts } from '../hooks/use-layouts';

vi.mock('../hooks/use-layouts', () => ({ useLayouts: vi.fn() }));

describe('LayoutSelect', () => {
  it('lists the real layouts returned by useLayouts', async () => {
    vi.mocked(useLayouts).mockReturnValue({
      data: { data: [{ id: 'l1', name: 'Sidebar Left' }], meta: {} },
      isLoading: false,
    } as never);
    const user = userEvent.setup();
    render(<LayoutSelect value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Sidebar Left' })).toBeInTheDocument();
  });

  it('selecting a layout calls onChange with its id', async () => {
    vi.mocked(useLayouts).mockReturnValue({
      data: { data: [{ id: 'l1', name: 'Sidebar Left' }], meta: {} },
      isLoading: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LayoutSelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Sidebar Left' }));
    expect(onChange).toHaveBeenCalledWith('l1');
  });

  it('is disabled while loading', () => {
    vi.mocked(useLayouts).mockReturnValue({ data: undefined, isLoading: true } as never);
    render(<LayoutSelect value="" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('only queries PUBLISHED layouts (an unpublished one can have no visible effect)', () => {
    vi.mocked(useLayouts).mockReturnValue({
      data: { data: [], meta: {} },
      isLoading: false,
    } as never);
    render(<LayoutSelect value="" onChange={vi.fn()} />);
    expect(useLayouts).toHaveBeenCalledWith(expect.objectContaining({ status: 'PUBLISHED' }));
  });
});
