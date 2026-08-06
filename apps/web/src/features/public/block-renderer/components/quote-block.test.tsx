import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuoteBlock } from './quote-block';

describe('QuoteBlock', () => {
  it('renders the quote text and citation', () => {
    render(
      <QuoteBlock
        block={{ id: 'b1', type: 'quote', data: { text: 'Be water.', citation: 'Bruce Lee' } }}
      />
    );
    expect(screen.getByText('Be water.')).toBeInTheDocument();
    expect(screen.getByText('— Bruce Lee')).toBeInTheDocument();
  });

  it('renders nothing when text is missing', () => {
    const { container } = render(<QuoteBlock block={{ id: 'b1', type: 'quote', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
