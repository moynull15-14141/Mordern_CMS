import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockSummaryPreview } from './block-summary-preview';

describe('BlockSummaryPreview', () => {
  it('renders the summarized text for a leaf block', () => {
    render(<BlockSummaryPreview block={{ type: 'paragraph', data: { text: 'Hello world' } }} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders a child count for a container block', () => {
    render(
      <BlockSummaryPreview
        block={{
          type: 'container',
          data: {},
          children: [{ id: 'a', type: 'paragraph', data: {} }],
        }}
      />
    );
    expect(screen.getByText('1 block')).toBeInTheDocument();
  });
});
