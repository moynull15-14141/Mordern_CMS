import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useModal } from './use-modal';
import { useModalStore } from '@/stores/modal-store';

afterEach(() => {
  useModalStore.setState({ stack: [] });
});

describe('useModal', () => {
  it('open() pushes a modal onto the shared store', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open('confirm', 'Are you sure?'));
    expect(useModalStore.getState().stack).toEqual([{ id: 'confirm', content: 'Are you sure?' }]);
  });

  it('close() removes the matching modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open('confirm', 'x'));
    act(() => result.current.close('confirm'));
    expect(useModalStore.getState().stack).toEqual([]);
  });

  it('closeAll() clears the stack', () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open('a', '1');
      result.current.open('b', '2');
    });
    act(() => result.current.closeAll());
    expect(useModalStore.getState().stack).toEqual([]);
  });
});
