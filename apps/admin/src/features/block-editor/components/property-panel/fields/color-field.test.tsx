import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorField } from './color-field';

describe('ColorField', () => {
  it('renders a swatch and a text input bound to the same value', () => {
    render(
      <ColorField
        descriptor={{ key: 'bg', label: 'Background', kind: 'color' }}
        value="#1a2b3c"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Background swatch')).toHaveValue('#1a2b3c');
    expect(screen.getAllByDisplayValue('#1a2b3c')).toHaveLength(2);
  });

  it('falls back the swatch to black for an invalid hex value', () => {
    render(
      <ColorField
        descriptor={{ key: 'bg', label: 'Background', kind: 'color' }}
        value="not-a-color"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Background swatch')).toHaveValue('#000000');
  });
});
