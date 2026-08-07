import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateThemeForm } from './theme-form';

/** `SiteDesignFields` has no standalone public export used outside
 * `theme-form.tsx` — tested through the real host form, same convention
 * `theme-form.test.tsx` already uses for `AppearanceSettingsFields`. */
describe('SiteDesignFields (via CreateThemeForm)', () => {
  it('renders every Site Design tab', () => {
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);
    for (const tab of [
      'Presets',
      'Colors',
      'Typography',
      'Buttons',
      'Cards & Forms',
      'Layout',
      'Header',
      'Footer',
      'Advanced',
    ]) {
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument();
    }
  });

  it('applying a preset fills in the Colors tab fields', async () => {
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(screen.getByRole('button', { name: /Minimal/ }));
    await user.click(screen.getByRole('tab', { name: 'Colors' }));

    await waitFor(() => expect(screen.getByLabelText('Primary')).toHaveValue('#000000'));
  });

  it('shows a low-contrast warning when text and background colors are too close', async () => {
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(screen.getByRole('tab', { name: 'Colors' }));
    await user.clear(screen.getByLabelText('Text'));
    await user.type(screen.getByLabelText('Text'), '#cccccc');
    await user.clear(screen.getByLabelText('Page background'));
    await user.type(screen.getByLabelText('Page background'), '#ffffff');

    await waitFor(() => expect(screen.getByText(/difficult to read/)).toBeInTheDocument());
  });

  it('does not show a contrast warning for a high-contrast pair', async () => {
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(screen.getByRole('tab', { name: 'Colors' }));
    await user.clear(screen.getByLabelText('Text'));
    await user.type(screen.getByLabelText('Text'), '#000000');
    await user.clear(screen.getByLabelText('Page background'));
    await user.type(screen.getByLabelText('Page background'), '#ffffff');

    expect(screen.queryByText(/difficult to read/)).not.toBeInTheDocument();
  });

  it('submits designTokens colors as part of the form payload', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Name'), 'My Theme');
    await user.click(screen.getByRole('tab', { name: 'Colors' }));
    await user.type(screen.getByLabelText('Primary'), '#123456');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            designTokens: expect.objectContaining({
              colors: expect.objectContaining({
                brand: expect.objectContaining({ primary: '#123456' }),
              }),
            }),
          }),
        })
      )
    );
  });
});
