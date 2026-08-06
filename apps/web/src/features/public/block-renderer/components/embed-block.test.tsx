import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { EmbedBlock } from './embed-block';

describe('EmbedBlock', () => {
  it('renders a sandboxed iframe pointed at the embed URL', () => {
    const { container } = render(
      <EmbedBlock block={{ id: 'b1', type: 'embed', data: { url: 'https://example.com/embed' } }} />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', 'https://example.com/embed');
    expect(iframe).toHaveAttribute('sandbox');
  });

  it('renders nothing when url is missing', () => {
    const { container } = render(<EmbedBlock block={{ id: 'b1', type: 'embed', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
