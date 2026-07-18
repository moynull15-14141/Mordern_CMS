import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingValueDisplay } from './setting-value-display';

describe('SettingValueDisplay', () => {
  it('redacts PASSWORD/SECRET values regardless of the underlying value', () => {
    render(<SettingValueDisplay setting={{ type: 'PASSWORD', value: 'super-secret' }} />);
    expect(screen.getByText('••••••••')).toBeInTheDocument();
    expect(screen.queryByText('super-secret')).not.toBeInTheDocument();
  });

  it('renders an em dash for a null/undefined non-sensitive value', () => {
    render(<SettingValueDisplay setting={{ type: 'STRING', value: null }} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders Yes/No for BOOLEAN', () => {
    const { rerender } = render(<SettingValueDisplay setting={{ type: 'BOOLEAN', value: true }} />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    rerender(<SettingValueDisplay setting={{ type: 'BOOLEAN', value: false }} />);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders JSON.stringify for ARRAY/JSON', () => {
    render(<SettingValueDisplay setting={{ type: 'ARRAY', value: ['a', 'b'] }} />);
    expect(screen.getByText('["a","b"]')).toBeInTheDocument();
  });

  it('renders the plain string form for other types', () => {
    render(<SettingValueDisplay setting={{ type: 'NUMBER', value: 42 }} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
