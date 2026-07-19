import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSelect } from './theme-select';
import { useThemes } from '@/features/themes';

vi.mock('@/features/themes', () => ({ useThemes: vi.fn() }));

describe('ThemeSelect', () => {
  it('renders "Compatible with any theme" as the default option', async () => {
    vi.mocked(useThemes).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Classic' }], meta: {} },
      isError: false,
    } as never);
    const user = userEvent.setup();
    render(<ThemeSelect value="" onChange={vi.fn()} />);

    expect(screen.getByText('Compatible with any theme')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Classic' })).toBeInTheDocument();
  });

  it('selecting a theme calls onChange with its id', async () => {
    vi.mocked(useThemes).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Classic' }], meta: {} },
      isError: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ThemeSelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Classic' }));
    expect(onChange).toHaveBeenCalledWith('t1');
  });

  it('selecting "Compatible with any theme" calls onChange with an empty string', async () => {
    vi.mocked(useThemes).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Classic' }], meta: {} },
      isError: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ThemeSelect value="t1" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Compatible with any theme' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows a permission message when the themes query errors', () => {
    vi.mocked(useThemes).mockReturnValue({ data: undefined, isError: true } as never);
    render(<ThemeSelect value="" onChange={vi.fn()} />);
    expect(screen.getByText(/permission to view themes/)).toBeInTheDocument();
  });
});
