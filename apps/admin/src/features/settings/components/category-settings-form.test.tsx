import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySettingsForm } from './category-settings-form';
import type { Setting } from '../types/settings';

function makeSetting(overrides: Partial<Setting>): Setting {
  return {
    key: 'general.siteName',
    category: 'general',
    type: 'STRING',
    label: 'Site Name',
    value: 'Modern CMS',
    source: 'DEFAULT',
    isReadOnly: false,
    isHidden: false,
    isEncrypted: false,
    ...overrides,
  };
}

describe('CategorySettingsForm', () => {
  it('renders one field per editable setting, pre-filled from its value', () => {
    const settings = [
      makeSetting({ key: 'general.siteName', label: 'Site Name', value: 'Modern CMS' }),
      makeSetting({ key: 'general.tagline', label: 'Tagline', value: 'Fast news', type: 'STRING' }),
    ];
    render(<CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByLabelText(/Site Name/)).toHaveValue('Modern CMS');
    expect(screen.getByLabelText(/Tagline/)).toHaveValue('Fast news');
  });

  it('renders read-only settings as a static row, not an editable field', () => {
    const settings = [
      makeSetting({ key: 'system.version', label: 'App Version', value: '1.0.0', isReadOnly: true, category: 'system' }),
    ];
    render(<CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByText('App Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Read-only')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('sensitive fields start blank regardless of their (redacted) value', () => {
    const settings = [
      makeSetting({ key: 'email.smtpPassword', label: 'SMTP Password', type: 'PASSWORD', value: null, category: 'email' }),
    ];
    render(<CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByPlaceholderText('Leave blank to keep unchanged')).toHaveValue('');
  });

  it('disables submit until the form becomes dirty', () => {
    const settings = [makeSetting({})];
    render(<CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('submits changed values as unqualified-key SettingEntry[], omitting untouched sensitive fields', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const settings = [
      makeSetting({ key: 'general.siteName', label: 'Site Name', value: 'Modern CMS' }),
      makeSetting({ key: 'general.adminEmail', label: 'Admin Email', type: 'PASSWORD', value: null }),
    ];
    render(<CategorySettingsForm settings={settings} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText(/Site Name/));
    await user.type(screen.getByLabelText(/Site Name/), 'New Name');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith([{ key: 'siteName', value: 'New Name' }]),
    );
  });

  it('parses an ARRAY field as newline-separated values on submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const settings = [makeSetting({ key: 'seo.sitemapExclusions', label: 'Sitemap Exclusions', type: 'ARRAY', value: [], category: 'seo' })];
    render(<CategorySettingsForm settings={settings} onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/Sitemap Exclusions/), '/admin{enter}/login');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith([{ key: 'sitemapExclusions', value: ['/admin', '/login'] }]),
    );
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    const settings = [makeSetting({})];
    render(
      <CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} onDirtyChange={onDirtyChange} />,
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText(/Site Name/), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });

  it('displays a submitError alert when given', () => {
    const settings = [makeSetting({})];
    render(
      <CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} submitError="Update failed." />,
    );
    expect(screen.getByText('Update failed.')).toBeInTheDocument();
  });

  it('does not render a submit button when every setting in the category is read-only', () => {
    const settings = [makeSetting({ isReadOnly: true })];
    render(<CategorySettingsForm settings={settings} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });
});
