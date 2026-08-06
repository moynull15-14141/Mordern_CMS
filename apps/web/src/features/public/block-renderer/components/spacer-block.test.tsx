import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SpacerBlock } from './spacer-block';

describe('SpacerBlock', () => {
  it('renders a div with the requested height', () => {
    const { container } = render(
      <SpacerBlock block={{ id: 'b1', type: 'spacer', data: { height: 80 } }} />
    );
    expect(container.firstChild).toHaveStyle({ height: '80px' });
  });

  it('defaults to 40px when height is missing', () => {
    const { container } = render(<SpacerBlock block={{ id: 'b1', type: 'spacer', data: {} }} />);
    expect(container.firstChild).toHaveStyle({ height: '40px' });
  });

  it('clamps an out-of-range height to the max', () => {
    const { container } = render(
      <SpacerBlock block={{ id: 'b1', type: 'spacer', data: { height: 99999 } }} />
    );
    expect(container.firstChild).toHaveStyle({ height: '400px' });
  });
});
