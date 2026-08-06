import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListBlock } from './list-block';

describe('ListBlock', () => {
  it('renders an ordered list', () => {
    render(
      <ListBlock
        block={{
          id: 'b1',
          type: 'list',
          data: { style: 'ordered', items: [{ text: 'One' }, { text: 'Two' }] },
        }}
      />
    );
    expect(screen.getByRole('list').tagName).toBe('OL');
    expect(screen.getByText('One')).toBeInTheDocument();
  });

  it('renders an unordered list by default', () => {
    render(<ListBlock block={{ id: 'b1', type: 'list', data: { items: [{ text: 'One' }] } }} />);
    expect(screen.getByRole('list').tagName).toBe('UL');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<ListBlock block={{ id: 'b1', type: 'list', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
