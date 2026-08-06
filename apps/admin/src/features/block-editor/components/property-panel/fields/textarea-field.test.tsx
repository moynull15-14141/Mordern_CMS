import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextareaField } from './textarea-field';

describe('TextareaField', () => {
  it('renders the current value', () => {
    render(
      <TextareaField
        descriptor={{ key: 'text', label: 'Text', kind: 'textarea' }}
        value="Hello"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });
});
