import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBlock } from './alert-block';

describe('AlertBlock', () => {
  it('renders the text with an alert role', () => {
    render(
      <AlertBlock
        block={{ id: 'b1', type: 'alert', data: { text: 'Careful', tone: 'critical' } }}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Careful');
  });

  it('renders nothing when text is missing', () => {
    const { container } = render(<AlertBlock block={{ id: 'b1', type: 'alert', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
