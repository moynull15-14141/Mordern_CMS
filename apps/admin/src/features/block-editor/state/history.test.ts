import { describe, expect, it } from 'vitest';
import { canRedo, canUndo, initHistory, pushHistory, redo, undo } from './history';
import type { BlockNode } from '../types/block.types';

const empty: BlockNode[] = [];
const one: BlockNode[] = [{ id: 'a', type: 'paragraph', data: {} }];
const two: BlockNode[] = [...one, { id: 'b', type: 'paragraph', data: {} }];

describe('history', () => {
  it('initializes with no undo/redo available', () => {
    const state = initHistory(empty);
    expect(canUndo(state)).toBe(false);
    expect(canRedo(state)).toBe(false);
    expect(state.present).toBe(empty);
  });

  it('pushHistory records the previous present onto past and clears future', () => {
    let state = initHistory(empty);
    state = pushHistory(state, one);
    expect(state.present).toBe(one);
    expect(state.past).toEqual([empty]);
    expect(state.future).toEqual([]);
  });

  it('undo restores the previous present and moves it to future', () => {
    let state = initHistory(empty);
    state = pushHistory(state, one);
    state = pushHistory(state, two);
    state = undo(state);
    expect(state.present).toBe(one);
    expect(canRedo(state)).toBe(true);
  });

  it('redo restores an undone present', () => {
    let state = initHistory(empty);
    state = pushHistory(state, one);
    state = undo(state);
    state = redo(state);
    expect(state.present).toBe(one);
    expect(canRedo(state)).toBe(false);
  });

  it('undo is a no-op at the start of history', () => {
    const state = initHistory(empty);
    expect(undo(state)).toBe(state);
  });

  it('redo is a no-op with nothing to redo', () => {
    const state = initHistory(empty);
    expect(redo(state)).toBe(state);
  });

  it('a new edit after an undo discards the redo branch', () => {
    let state = initHistory(empty);
    state = pushHistory(state, one);
    state = undo(state);
    state = pushHistory(state, two);
    expect(canRedo(state)).toBe(false);
    expect(state.present).toBe(two);
  });
});
