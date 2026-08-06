import { BlockTreeValidator } from './block-tree.validator';
import { InvalidBlockTreeException } from '../exceptions/content-blocks.exceptions';
import { BlockNode } from '../interfaces/block-node.interface';

function node(overrides: Partial<BlockNode> = {}): BlockNode {
  return { id: 'block-1', type: 'paragraph', data: { text: 'hello' }, ...overrides };
}

describe('BlockTreeValidator', () => {
  const validator = new BlockTreeValidator();

  describe('top-level shape', () => {
    it('accepts an empty block tree', () => {
      expect(() => validator.assertValid({ blocks: [] })).not.toThrow();
    });

    it('rejects a non-object body', () => {
      expect(() => validator.assertValid('nope')).toThrow(InvalidBlockTreeException);
      expect(() => validator.assertValid(null)).toThrow(InvalidBlockTreeException);
      expect(() => validator.assertValid([])).toThrow(InvalidBlockTreeException);
    });

    it('rejects a body without a blocks array', () => {
      expect(() => validator.assertValid({})).toThrow(InvalidBlockTreeException);
      expect(() => validator.assertValid({ blocks: 'nope' })).toThrow(InvalidBlockTreeException);
    });
  });

  describe('per-node shape', () => {
    it('rejects a node missing an id', () => {
      expect(() => validator.assertValid({ blocks: [node({ id: undefined as never })] })).toThrow(
        InvalidBlockTreeException
      );
    });

    it('rejects an unknown block type', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'not-a-real-type' as never })] })
      ).toThrow(InvalidBlockTreeException);
    });

    it('rejects a node whose data is not an object', () => {
      expect(() => validator.assertValid({ blocks: [node({ data: 'nope' as never })] })).toThrow(
        InvalidBlockTreeException
      );
    });
  });

  describe('required fields per block type', () => {
    it('rejects a paragraph missing required text', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'paragraph', data: {} })] })
      ).toThrow(InvalidBlockTreeException);
    });

    it('accepts a valid paragraph', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'paragraph', data: { text: 'hi' } })] })
      ).not.toThrow();
    });

    it('accepts a divider with no fields at all', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'divider', data: {} })] })
      ).not.toThrow();
    });

    it('rejects a heading with an out-of-range level', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ type: 'heading', data: { text: 'Hi', level: '9' } })],
        })
      ).toThrow(InvalidBlockTreeException);
    });

    it('accepts a heading with a valid level', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ type: 'heading', data: { text: 'Hi', level: '2' } })],
        })
      ).not.toThrow();
    });

    it('rejects a button whose openInNewTab is not a boolean', () => {
      expect(() =>
        validator.assertValid({
          blocks: [
            node({
              type: 'button',
              data: { label: 'Go', url: 'https://example.com', openInNewTab: 'yes' },
            }),
          ],
        })
      ).toThrow(InvalidBlockTreeException);
    });

    it('rejects a spacer whose height is not a number', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'spacer', data: { height: '40' } })] })
      ).toThrow(InvalidBlockTreeException);
    });
  });

  describe('list fields (recursive)', () => {
    it('accepts a valid checklist', () => {
      expect(() =>
        validator.assertValid({
          blocks: [
            node({
              type: 'checklist',
              data: { items: [{ text: 'Do a thing', checked: true }, { text: 'Do another' }] },
            }),
          ],
        })
      ).not.toThrow();
    });

    it('rejects a checklist item missing required text', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ type: 'checklist', data: { items: [{ checked: true }] } })],
        })
      ).toThrow(InvalidBlockTreeException);
    });

    it('accepts a table with nested rows-of-cells (list within list)', () => {
      expect(() =>
        validator.assertValid({
          blocks: [
            node({
              type: 'table',
              data: {
                headers: [{ text: 'Name' }, { text: 'Value' }],
                rows: [{ cells: [{ text: 'A' }, { text: '1' }] }],
              },
            }),
          ],
        })
      ).not.toThrow();
    });

    it('rejects a table row cell missing required text', () => {
      expect(() =>
        validator.assertValid({
          blocks: [
            node({
              type: 'table',
              data: { headers: [], rows: [{ cells: [{}] }] },
            }),
          ],
        })
      ).toThrow(InvalidBlockTreeException);
    });
  });

  describe('children / nesting', () => {
    it('accepts children on a container type', () => {
      expect(() =>
        validator.assertValid({
          blocks: [
            node({
              id: 'columns-1',
              type: 'columns',
              data: { columnCount: '2' },
              children: [
                node({ id: 'child-1', meta: { column: 0 } }),
                node({ id: 'child-2', meta: { column: 1 } }),
              ],
            }),
          ],
        })
      ).not.toThrow();
    });

    it('rejects children on a non-container type', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ type: 'paragraph', data: { text: 'hi' }, children: [node()] })],
        })
      ).toThrow(InvalidBlockTreeException);
    });

    it('rejects nesting deeper than the max depth', () => {
      let deepest: BlockNode = node({ id: 'leaf' });
      for (let i = 0; i < 7; i += 1) {
        deepest = node({ id: `container-${i}`, type: 'container', data: {}, children: [deepest] });
      }
      expect(() => validator.assertValid({ blocks: [deepest] })).toThrow(InvalidBlockTreeException);
    });

    it('rejects a tree exceeding the max block count', () => {
      const blocks = Array.from({ length: 501 }, (_, i) => node({ id: `block-${i}` }));
      expect(() => validator.assertValid({ blocks })).toThrow(InvalidBlockTreeException);
    });
  });

  describe('meta', () => {
    it('accepts a well-formed meta object', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ meta: { anchor: 'intro', cssClass: 'lead' } })],
        })
      ).not.toThrow();
    });

    it('rejects a non-object meta', () => {
      expect(() => validator.assertValid({ blocks: [node({ meta: 'nope' as never })] })).toThrow(
        InvalidBlockTreeException
      );
    });
  });

  describe('reusable-block reference', () => {
    it('accepts a valid reference', () => {
      expect(() =>
        validator.assertValid({
          blocks: [node({ type: 'reusable-block', data: { reusableBlockId: 'rb-1' } })],
        })
      ).not.toThrow();
    });

    it('rejects a missing reusableBlockId', () => {
      expect(() =>
        validator.assertValid({ blocks: [node({ type: 'reusable-block', data: {} })] })
      ).toThrow(InvalidBlockTreeException);
    });
  });
});
