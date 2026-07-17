import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentContainer, PageContainer } from './containers';

describe('PageContainer', () => {
  it('renders its children', () => {
    render(<PageContainer>Page body</PageContainer>);
    expect(screen.getByText('Page body')).toBeInTheDocument();
  });

  it('merges a custom className with the base layout classes', () => {
    render(
      <PageContainer className="bg-red-500" data-testid="page">
        content
      </PageContainer>
    );
    const el = screen.getByTestId('page');
    expect(el).toHaveClass('bg-red-500');
    expect(el).toHaveClass('mx-auto');
  });
});

describe('ContentContainer', () => {
  it('renders its children', () => {
    render(<ContentContainer>Content body</ContentContainer>);
    expect(screen.getByText('Content body')).toBeInTheDocument();
  });

  it('applies vertical rhythm spacing by default', () => {
    render(<ContentContainer data-testid="content">x</ContentContainer>);
    expect(screen.getByTestId('content')).toHaveClass('space-y-6');
  });
});
