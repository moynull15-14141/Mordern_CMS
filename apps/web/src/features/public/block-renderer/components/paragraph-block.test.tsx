import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParagraphBlock } from './paragraph-block';

describe('ParagraphBlock', () => {
  it('renders the text', () => {
    render(
      <ParagraphBlock block={{ id: 'b1', type: 'paragraph', data: { text: 'Hello world' } }} />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders nothing when text is missing', () => {
    const { container } = render(
      <ParagraphBlock block={{ id: 'b1', type: 'paragraph', data: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
