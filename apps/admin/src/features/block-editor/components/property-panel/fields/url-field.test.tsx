import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UrlField } from './url-field';

describe('UrlField', () => {
  it('renders as a url input with the current value', () => {
    render(
      <UrlField
        descriptor={{ key: 'url', label: 'URL', kind: 'url' }}
        value="https://example.com"
        onChange={vi.fn()}
      />
    );
    const input = screen.getByDisplayValue('https://example.com');
    expect(input).toHaveAttribute('type', 'url');
  });
});
