import { describe, expect, it, vi } from 'vitest';
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

  it('hydrate is a no-op (same state object, no listener notification) when the incoming blocks are structurally identical to the current tree', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    store.getState().selectBlock('a');
    const stateBefore = store.getState();

    const listener = vi.fn();
    store.subscribe(listener);

    // A new array reference, same content — the exact shape a re-rendered
    // controlled parent can hand back even though nothing changed.
    store.getState().hydrate([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);

    expect(store.getState()).toBe(stateBefore);
    expect(store.getState().selectedId).toBe('a');
    expect(listener).not.toHaveBeenCalled();
  });

  it('replaceBlockById swaps a top-level block for a whole new node', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    store.getState().replaceBlockById('a', {
      id: 'rb-ref',
      type: 'reusable-block',
      data: { reusableBlockId: 'rb-1' },
    });

    const present = store.getState().history.present;
    expect(present).toHaveLength(1);
    expect(present[0]).toEqual({
      id: 'rb-ref',
      type: 'reusable-block',
      data: { reusableBlockId: 'rb-1' },
    });
  });

  it('replaceBlockById replaces a block nested inside a container', () => {
    const store = createEditorStore([
      {
        id: 'container-1',
        type: 'container',
        data: {},
        children: [{ id: 'a', type: 'paragraph', data: { text: 'hi' } }],
      },
    ]);
    store
      .getState()
      .replaceBlockById('a', { id: 'b', type: 'heading', data: { text: 'New', level: '2' } });

    const child = store.getState().history.present[0].children?.[0];
    expect(child).toEqual({ id: 'b', type: 'heading', data: { text: 'New', level: '2' } });
  });

  it('replaceBlockById moves selection onto the new node when the replaced block was selected', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: {} }]);
    store.getState().selectBlock('a');
    store
      .getState()
      .replaceBlockById('a', { id: 'b', type: 'heading', data: { text: '', level: '2' } });
    expect(store.getState().selectedId).toBe('b');
  });

  it('replaceBlockById leaves selection untouched when a different block was selected', () => {
    const store = createEditorStore([
      { id: 'a', type: 'paragraph', data: {} },
      { id: 'other', type: 'paragraph', data: {} },
    ]);
    store.getState().selectBlock('other');
    store
      .getState()
      .replaceBlockById('a', { id: 'b', type: 'heading', data: { text: '', level: '2' } });
    expect(store.getState().selectedId).toBe('other');
  });

  it('replaceBlockById is undoable', () => {
    const store = createEditorStore([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    store
      .getState()
      .replaceBlockById('a', { id: 'b', type: 'heading', data: { text: '', level: '2' } });
    store.getState().undo();
    expect(store.getState().history.present[0]).toEqual({
      id: 'a',
      type: 'paragraph',
      data: { text: 'hi' },
    });
  });

  it('insertClonedNodes clones each node with fresh ids (root and nested) and selects the last root', () => {
    const store = createEditorStore([]);
    const nodes: BlockNode[] = [
      { id: 'source-a', type: 'paragraph', data: { text: 'one' } },
      {
        id: 'source-b',
        type: 'container',
        data: {},
        children: [{ id: 'source-b-child', type: 'paragraph', data: { text: 'nested' } }],
      },
    ];
    const insertedIds = store.getState().insertClonedNodes(nodes, null, 0);

    const present = store.getState().history.present;
    expect(present).toHaveLength(2);
    expect(insertedIds).toEqual([present[0].id, present[1].id]);
    expect(present[0].id).not.toBe('source-a');
    expect(present[1].id).not.toBe('source-b');
    expect(present[1].children?.[0].id).not.toBe('source-b-child');
    expect(present[1].children?.[0].data).toEqual({ text: 'nested' });
    expect(store.getState().selectedId).toBe(present[1].id);

    // Original nodes passed in are never mutated — the source pattern's
    // own ids stay intact for any other use of the same reference.
    expect(nodes[0].id).toBe('source-a');
  });

  it('insertClonedNodes is undoable as a single history entry', () => {
    const store = createEditorStore([{ id: 'existing', type: 'paragraph', data: {} }]);
    store.getState().insertClonedNodes(
      [
        { id: 'x', type: 'paragraph', data: {} },
        { id: 'y', type: 'paragraph', data: {} },
      ],
      null,
      1
    );
    expect(store.getState().history.present).toHaveLength(3);
    store.getState().undo();
    expect(store.getState().history.present).toHaveLength(1);
    expect(store.getState().history.present[0].id).toBe('existing');
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
