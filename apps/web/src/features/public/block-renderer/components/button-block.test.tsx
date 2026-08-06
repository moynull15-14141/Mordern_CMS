import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonBlock } from './button-block';

describe('ButtonBlock', () => {
  it('renders a link with the label and url', () => {
    render(
      <ButtonBlock
        block={{ id: 'b1', type: 'button', data: { label: 'Buy now', url: 'https://example.com' } }}
      />
    );
    expect(screen.getByRole('link', { name: 'Buy now' })).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('adds rel=noopener noreferrer when opening in a new tab', () => {
    render(
      <ButtonBlock
        block={{
          id: 'b1',
          type: 'button',
          data: { label: 'Buy now', url: 'https://example.com', openInNewTab: true },
        }}
      />
    );
    expect(screen.getByRole('link', { name: 'Buy now' })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('renders nothing for an unsafe (javascript:) url', () => {
    const { container } = render(
      <ButtonBlock
        block={{ id: 'b1', type: 'button', data: { label: 'Go', url: 'javascript:alert(1)' } }}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when label or url is missing', () => {
    const { container } = render(
      <ButtonBlock block={{ id: 'b1', type: 'button', data: { label: 'x' } }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
