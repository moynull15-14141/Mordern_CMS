import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingBlock } from './heading-block';

describe('HeadingBlock', () => {
  it('renders the requested heading level', () => {
    render(
      <HeadingBlock block={{ id: 'b1', type: 'heading', data: { text: 'Title', level: '3' } }} />
    );
    expect(screen.getByRole('heading', { name: 'Title', level: 3 })).toBeInTheDocument();
  });

  it('defaults to level 2 for a missing/invalid level', () => {
    render(<HeadingBlock block={{ id: 'b1', type: 'heading', data: { text: 'Title' } }} />);
    expect(screen.getByRole('heading', { name: 'Title', level: 2 })).toBeInTheDocument();
  });

  it('renders nothing when text is missing', () => {
    const { container } = render(<HeadingBlock block={{ id: 'b1', type: 'heading', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
