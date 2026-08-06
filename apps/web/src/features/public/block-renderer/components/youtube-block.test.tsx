import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { YoutubeBlock } from './youtube-block';

describe('YoutubeBlock', () => {
  it('renders an iframe pointed at the youtube embed URL', () => {
    const { container } = render(
      <YoutubeBlock block={{ id: 'b1', type: 'youtube', data: { videoId: 'abc123' } }} />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123');
  });

  it('renders nothing when videoId is missing', () => {
    const { container } = render(<YoutubeBlock block={{ id: 'b1', type: 'youtube', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
