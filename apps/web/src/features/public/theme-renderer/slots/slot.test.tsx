import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Slot } from './slot';

describe('Slot', () => {
  it('renders children wrapped in a data-slot element', () => {
    render(<Slot name="hero">Hero content</Slot>);
    const el = screen.getByText('Hero content');
    expect(el.closest('[data-slot="hero"]')).not.toBeNull();
  });

  it('renders nothing when children is undefined', () => {
    const { container } = render(<Slot name="sidebar" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when children is explicitly null', () => {
    const { container } = render(<Slot name="sidebar">{null}</Slot>);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders falsy-but-real content like the number 0', () => {
    render(<Slot name="content">{0}</Slot>);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
