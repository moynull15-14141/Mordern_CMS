import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsFilters } from './settings-filters';

describe('SettingsFilters', () => {
  it('renders a Category control', () => {
    render(<SettingsFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('does not render a "Clear filters" button when nothing is active', () => {
    render(<SettingsFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows "Clear filters" once a category is active, and clears on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SettingsFilters value={{ category: 'seo' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('selecting a category calls onChange with that category', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SettingsFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Category'));
    await user.click(await screen.findByRole('option', { name: 'SEO' }));

    expect(onChange).toHaveBeenCalledWith({ category: 'seo' });
  });

  it('selecting "All categories" clears the category filter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SettingsFilters value={{ category: 'seo' }} onChange={onChange} />);

    await user.click(screen.getByLabelText('Category'));
    await user.click(await screen.findByRole('option', { name: 'All categories' }));

    expect(onChange).toHaveBeenCalledWith({ category: undefined });
  });

  it('lists all 17 frozen setting categories as options', async () => {
    const user = userEvent.setup();
    render(<SettingsFilters value={{}} onChange={vi.fn()} />);

    await user.click(screen.getByLabelText('Category'));
    expect(await screen.findByRole('option', { name: 'Feature Flags' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Developer' })).toBeInTheDocument();
  });
});
