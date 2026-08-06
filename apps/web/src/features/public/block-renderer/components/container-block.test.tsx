import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContainerBlock } from './container-block';

describe('ContainerBlock', () => {
  it('renders its children', () => {
    render(
      <ContainerBlock
        block={{
          id: 'b1',
          type: 'container',
          data: { maxWidth: 'narrow', padding: 'lg' },
          children: [{ id: 'c1', type: 'paragraph', data: { text: 'Inside' } }],
        }}
      />
    );
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('renders an empty wrapper for no children', () => {
    const { container } = render(
      <ContainerBlock block={{ id: 'b1', type: 'container', data: {} }} />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
