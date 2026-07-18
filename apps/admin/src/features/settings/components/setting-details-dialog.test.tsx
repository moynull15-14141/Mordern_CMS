import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingDetailsDialog } from './setting-details-dialog';
import type { Setting } from '../types/settings';

const setting: Setting = {
  key: 'seo.metaTitle',
  category: 'seo',
  type: 'STRING',
  label: 'Meta Title',
  description: 'The default page title.',
  value: 'Modern CMS',
  source: 'DATABASE',
  isReadOnly: false,
  isHidden: false,
  isEncrypted: false,
};

describe('SettingDetailsDialog', () => {
  it('renders the setting label, key, category, type, value, and source', () => {
    render(<SettingDetailsDialog open onOpenChange={vi.fn()} setting={setting} />);

    expect(screen.getByText('Meta Title')).toBeInTheDocument();
    expect(screen.getByText('seo.metaTitle')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
    expect(screen.getByText('STRING')).toBeInTheDocument();
    expect(screen.getByText('Modern CMS')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('shows "None" for flags when no flag is set', () => {
    render(<SettingDetailsDialog open onOpenChange={vi.fn()} setting={setting} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('shows badges for isReadOnly/isHidden/isEncrypted flags', () => {
    render(
      <SettingDetailsDialog
        open
        onOpenChange={vi.fn()}
        setting={{ ...setting, isReadOnly: true, isEncrypted: true }}
      />,
    );
    expect(screen.getByText('Read-only')).toBeInTheDocument();
    expect(screen.getByText('Encrypted')).toBeInTheDocument();
  });

  it('redacts a sensitive setting value even in the details view', () => {
    render(
      <SettingDetailsDialog
        open
        onOpenChange={vi.fn()}
        setting={{ ...setting, type: 'SECRET', value: null }}
      />,
    );
    expect(screen.getByText('••••••••')).toBeInTheDocument();
  });

  it('renders nothing when setting is null', () => {
    const { container } = render(<SettingDetailsDialog open onOpenChange={vi.fn()} setting={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
