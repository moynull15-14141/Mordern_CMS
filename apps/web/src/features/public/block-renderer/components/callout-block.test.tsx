import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalloutBlock } from './callout-block';

describe('CalloutBlock', () => {
  it('renders title and text', () => {
    render(
      <CalloutBlock
        block={{ id: 'b1', type: 'callout', data: { title: 'Note', text: 'Read this' } }}
      />
    );
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Read this')).toBeInTheDocument();
  });

  it('renders nothing when text is missing', () => {
    const { container } = render(<CalloutBlock block={{ id: 'b1', type: 'callout', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
