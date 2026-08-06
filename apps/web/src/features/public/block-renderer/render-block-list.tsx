import type { ReactNode } from 'react';
import type { BlockNode } from './types/block.types';
import { getBlockComponent } from './registry/block-registry';

/**
 * The one place a `BlockNode[]` is walked and turned into React elements —
 * a single `getBlockComponent(block.type)` registry lookup per node, never
 * a `switch`/`if`-chain on `block.type`. `BlockRenderer` (the public entry
 * point) and every container block component (`ColumnsBlock`/
 * `ContainerBlock`/`AccordionBlock`/`TabsBlock`, for their own children)
 * both call this same function — one recursive core, not one renderer per
 * caller.
 */
export function renderBlockList(blocks: BlockNode[] | undefined): ReactNode {
  if (!blocks || blocks.length === 0) return null;

  return blocks.map((block) => {
    const Component = getBlockComponent(block.type);
    if (!Component) return null;
    return <Component key={block.id} block={block} />;
  });
}
