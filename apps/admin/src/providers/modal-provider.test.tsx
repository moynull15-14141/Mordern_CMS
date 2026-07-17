import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ModalProvider } from './modal-provider';
import { useModalStore } from '@/stores/modal-store';

afterEach(() => {
  act(() => {
    useModalStore.setState({ stack: [] });
  });
});

describe('ModalProvider', () => {
  it('renders children when the modal stack is empty', () => {
    render(
      <ModalProvider>
        <div>App content</div>
      </ModalProvider>
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('renders a modal pushed onto the store after mount', () => {
    render(
      <ModalProvider>
        <div>App content</div>
      </ModalProvider>
    );
    act(() => useModalStore.getState().open('confirm', <div>Are you sure?</div>));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders multiple stacked modals simultaneously', () => {
    render(
      <ModalProvider>
        <div>App content</div>
      </ModalProvider>
    );
    act(() => {
      useModalStore.getState().open('a', <div>Modal A</div>);
      useModalStore.getState().open('b', <div>Modal B</div>);
    });
    expect(screen.getByText('Modal A')).toBeInTheDocument();
    expect(screen.getByText('Modal B')).toBeInTheDocument();
  });

  it('removes a modal from the DOM once closed', () => {
    render(
      <ModalProvider>
        <div>App content</div>
      </ModalProvider>
    );
    act(() => useModalStore.getState().open('confirm', <div>Are you sure?</div>));
    act(() => useModalStore.getState().close('confirm'));
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });
});
