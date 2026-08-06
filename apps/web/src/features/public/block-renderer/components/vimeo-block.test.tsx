import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { VimeoBlock } from './vimeo-block';

describe('VimeoBlock', () => {
  it('renders an iframe pointed at the vimeo player URL', () => {
    const { container } = render(
      <VimeoBlock block={{ id: 'b1', type: 'vimeo', data: { videoId: '999' } }} />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', 'https://player.vimeo.com/video/999');
  });

  it('renders nothing when videoId is missing', () => {
    const { container } = render(<VimeoBlock block={{ id: 'b1', type: 'vimeo', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
