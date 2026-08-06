import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableBlock } from './table-block';

describe('TableBlock', () => {
  it('renders headers and nested rows-of-cells', () => {
    render(
      <TableBlock
        block={{
          id: 'b1',
          type: 'table',
          data: {
            headers: [{ text: 'Name' }, { text: 'Value' }],
            rows: [{ cells: [{ text: 'A' }, { text: '1' }] }],
          },
        }}
      />
    );
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
  });

  it('renders nothing for an empty table', () => {
    const { container } = render(<TableBlock block={{ id: 'b1', type: 'table', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
