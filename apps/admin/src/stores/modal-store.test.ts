import { afterEach, describe, expect, it } from 'vitest';
import { useModalStore } from './modal-store';

afterEach(() => {
  useModalStore.setState({ stack: [] });
});

describe('useModalStore', () => {
  it('starts with an empty stack', () => {
    expect(useModalStore.getState().stack).toEqual([]);
  });

  it('open() pushes a modal entry onto the stack', () => {
    useModalStore.getState().open('m1', 'content-1');
    expect(useModalStore.getState().stack).toEqual([{ id: 'm1', content: 'content-1' }]);
  });

  it('open() with an existing id replaces that entry rather than duplicating it', () => {
    useModalStore.getState().open('m1', 'first');
    useModalStore.getState().open('m1', 'second');
    expect(useModalStore.getState().stack).toEqual([{ id: 'm1', content: 'second' }]);
  });

  it('close() removes only the matching entry', () => {
    useModalStore.getState().open('m1', 'a');
    useModalStore.getState().open('m2', 'b');
    useModalStore.getState().close('m1');
    expect(useModalStore.getState().stack).toEqual([{ id: 'm2', content: 'b' }]);
  });

  it('closeAll() empties the stack', () => {
    useModalStore.getState().open('m1', 'a');
    useModalStore.getState().open('m2', 'b');
    useModalStore.getState().closeAll();
    expect(useModalStore.getState().stack).toEqual([]);
  });
});
