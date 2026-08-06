import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderField } from './render-field';

describe('renderField', () => {
  it('dispatches to the registered component for a known kind', () => {
    render(
      <>
        {renderField({
          descriptor: { key: 'x', label: 'X', kind: 'text' },
          value: 'hi',
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByDisplayValue('hi')).toBeInTheDocument();
  });

  it('maps richtext to the same component as textarea', () => {
    render(
      <>
        {renderField({
          descriptor: { key: 'x', label: 'X', kind: 'richtext' },
          value: 'hi',
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it("dispatches list to ListField, including recursively for nested list-of-list items (regression: a naive eager registry object literal reads ListField as undefined here under Vite/Vitest's circular-import evaluation order)", () => {
    render(
      <>
        {renderField({
          descriptor: {
            key: 'rows',
            label: 'Rows',
            kind: 'list',
            itemFields: [
              {
                key: 'cells',
                label: 'Cells',
                kind: 'list',
                itemFields: [{ key: 'text', label: 'Text', kind: 'text', required: true }],
              },
            ],
          },
          value: [{ cells: [{ text: 'A' }] }],
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
  });

  it('renders nothing for an unregistered kind', () => {
    const { container } = render(
      <>
        {renderField({
          descriptor: { key: 'x', label: 'X', kind: 'not-a-real-kind' as never },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
