import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HtmlBlock } from './html-block';

describe('HtmlBlock', () => {
  it('renders the (already backend-sanitized) HTML', () => {
    render(<HtmlBlock block={{ id: 'b1', type: 'html-block', data: { html: '<p>Hello</p>' } }} />);
    expect(screen.getByTestId('html-block')).toContainHTML('<p>Hello</p>');
  });

  it('renders nothing when html is missing', () => {
    const { container } = render(<HtmlBlock block={{ id: 'b1', type: 'html-block', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
