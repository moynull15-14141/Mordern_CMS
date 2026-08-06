import { describe, expect, it } from 'vitest';
import { createEditorStore } from './create-editor-store';
import type { BlockNode } from '../types/block.types';

describe('createEditorStore', () => {
  it('two instances never share state', () => {
    const storeA = createEditorStore([]);
    const storeB = createEditorStore([]);
    storeA.getState().insertBlock('paragraph', null, 0);
    expect(storeA.getState().history.present).toHaveLength(1);
    expect(storeB.getState().history.present).toHaveLength(0);
  });

  it('insertBlock seeds the new node from the registered defaultData and selects it', () => {
    const store = createEditorStore([]);
    const id = store.getState().insertBlock('heading', null, 0);
    const inserted = store.getState().history.present[0];
    expect(inserted.id).toBe(id);
    expect(inserted.data).toEqual({ text: '', level: '2' });
    expect(store.getState().selectedId).toBe(id);
  });

  it('updateBlockData updates the block and is undoable', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'old' } }]);
    store.getState().updateBlockData('a', { text: 'new' });
    expect(store.getState().history.present[0].data).toEqual({ text: 'new' });
    store.getState().undo();
    expect(store.getState().history.present[0].data).toEqual({ text: 'old' });
  });

  it('removeBlockById clears selection if the removed block was selected', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: {} }]);
    store.getState().selectBlock('a');
    store.getState().removeBlockById('a');
    expect(store.getState().history.present).toHaveLength(0);
    expect(store.getState().selectedId).toBeNull();
  });

  it('duplicateBlockById inserts a fresh-id clone right after the original and selects it', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    store.getState().duplicateBlockById('a');
    const present = store.getState().history.present;
    expect(present).toHaveLength(2);
    expect(present[0].id).toBe('a');
    expect(present[1].id).not.toBe('a');
    expect(present[1].data).toEqual({ text: 'hi' });
    expect(store.getState().selectedId).toBe(present[1].id);
  });

  it('copyBlockById + pasteClipboard inserts a fresh-id clone at the target location', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    store.getState().copyBlockById('a');
    store.getState().pasteClipboard(null, 1);
    const present = store.getState().history.present;
    expect(present).toHaveLength(2);
    expect(present[1].id).not.toBe('a');
  });

  it('pasteClipboard is a no-op when the clipboard is empty', () => {
    const store = createEditorStore([]);
    store.getState().pasteClipboard(null, 0);
    expect(store.getState().history.present).toHaveLength(0);
  });

  it('undo/redo round-trips through insert', () => {
    const store = createEditorStore([]);
    store.getState().insertBlock('paragraph', null, 0);
    expect(store.getState().history.present).toHaveLength(1);
    store.getState().undo();
    expect(store.getState().history.present).toHaveLength(0);
    store.getState().redo();
    expect(store.getState().history.present).toHaveLength(1);
  });

  it('hydrate replaces the tree and resets history/selection', () => {
    const store = createEditorStore([]);
    store.getState().insertBlock('paragraph', null, 0);
    store.getState().selectBlock(store.getState().history.present[0].id);

    const external: BlockNode[] = [{ id: 'external', type: 'paragraph', data: {} }];
    store.getState().hydrate(external);

    expect(store.getState().history.present).toBe(external);
    expect(store.getState().selectedId).toBeNull();
    expect(store.getState().history.past).toEqual([]);
  });

  it('moveBlockTo reorders the tree and is undoable', () => {
    const store = createEditorStore([
      { id: 'a', type: 'paragraph', data: {} },
      { id: 'b', type: 'paragraph', data: {} },
    ]);
    store.getState().moveBlockTo('b', null, 0);
    expect(store.getState().history.present.map((n) => n.id)).toEqual(['b', 'a']);
    store.getState().undo();
    expect(store.getState().history.present.map((n) => n.id)).toEqual(['a', 'b']);
  });
});
