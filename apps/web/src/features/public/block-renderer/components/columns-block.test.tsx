import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColumnsBlock } from './columns-block';

describe('ColumnsBlock', () => {
  it('renders the requested number of columns with grouped children', () => {
    render(
      <ColumnsBlock
        block={{
          id: 'b1',
          type: 'columns',
          data: { columnCount: '3' },
          children: [
            { id: 'c1', type: 'paragraph', data: { text: 'Left' }, meta: { column: 0 } },
            { id: 'c2', type: 'paragraph', data: { text: 'Right' }, meta: { column: 2 } },
          ],
        }}
      />
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('defaults to 2 columns when columnCount is invalid', () => {
    const { container } = render(<ColumnsBlock block={{ id: 'b1', type: 'columns', data: {} }} />);
    expect(container.firstChild?.childNodes).toHaveLength(2);
  });
});
