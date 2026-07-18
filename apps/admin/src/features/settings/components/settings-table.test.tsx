import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsTable } from './settings-table';
import type { Setting } from '../types/settings';

function makeSetting(overrides: Partial<Setting> = {}): Setting {
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

const baseProps = {
  data: [makeSetting()],
  onPageChange: vi.fn(),
  onLimitChange: vi.fn(),
  sorting: [],
  onSortingChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
};

describe('SettingsTable', () => {
  it('renders label, key, category, type, and value columns', () => {
    render(<SettingsTable {...baseProps} />);
    expect(screen.getByText('Site Name')).toBeInTheDocument();
    expect(screen.getByText('general.siteName')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('STRING')).toBeInTheDocument();
    expect(screen.getByText('Modern CMS')).toBeInTheDocument();
  });

  it('redacts a sensitive setting value in the Value column', () => {
    render(<SettingsTable {...baseProps} data={[makeSetting({ type: 'PASSWORD', value: null })]} />);
    expect(screen.getByText('••••••••')).toBeInTheDocument();
  });

  it('shows View details/Edit actions and calls the right callback', async () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<SettingsTable {...baseProps} onView={onView} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Site Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ key: 'general.siteName' }));

    await user.click(screen.getByRole('button', { name: 'Actions for Site Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ key: 'general.siteName' }));
  });

  it('renders the empty state when no settings match', () => {
    render(<SettingsTable {...baseProps} data={[]} />);
    expect(screen.getByText('No settings match your filters')).toBeInTheDocument();
  });

  it('forwards the filters slot into the table toolbar', () => {
    render(<SettingsTable {...baseProps} filters={<div>Category filter here</div>} />);
    expect(screen.getByText('Category filter here')).toBeInTheDocument();
  });
});
