import { Injectable } from '@nestjs/common';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { collectReusableBlockReferenceIds } from '../utils/block-tree-references.util';
import { ReusableBlockCircularReferenceException } from '../exceptions/content-blocks.exceptions';
import { MAX_CYCLE_WALK_VISITS } from '../constants/reusable-block.constants';
import { BlockNode } from '../interfaces/block-node.interface';

/**
 * Rejects saving a reusable block whose reference graph would loop back to
 * itself — e.g. reusable block "A" embeds a `reusable-block` node pointing
 * at "B", whose own tree embeds a `reusable-block` node pointing back at
 * "A". Nothing else in this stack guards against this once reusable
 * blocks can carry `children` (see `ReusableBlocksService`) — the public
 * renderer's own one-level "don't resolve a resolved block whose type is
 * also reusable-block" check is a blunt rendering-time backstop, not real
 * cycle detection, and doesn't stop the cycle from being authored.
 *
 * Algorithm: collect every id the CANDIDATE tree references directly. For
 * each, walk that block's *persisted* tree (depth-first), collecting its
 * own references in turn — if the walk ever reaches `candidateId`, saving
 * would close a loop. A `visited` set makes this safe on a large/cyclic
 * *existing* graph too (impossible today since every prior save already
 * passed this same check, but defensive regardless): whether a block can
 * reach the candidate depends only on that block's own persisted
 * references, never on which path reached it, so visiting each node once
 * is correct, not just an optimization.
 */
@Injectable()
export class ReusableBlockCycleValidator {
  constructor(private readonly repository: ReusableBlockRepository) {}

  async assertNoCycle(
    candidateId: string | undefined,
    candidateName: string,
    blockType: string,
    data: Record<string, unknown>,
    children: BlockNode[] | undefined
  ): Promise<void> {
    const directIds = collectReusableBlockReferenceIds([{ type: blockType, data, children }]);
    const visited = new Set<string>();

    for (const nextId of directIds) {
      await this.walk(nextId, candidateId, [candidateName], visited);
    }
  }

  private async walk(
    currentId: string,
    targetId: string | undefined,
    namesSoFar: string[],
    visited: Set<string>
  ): Promise<void> {
    if (targetId !== undefined && currentId === targetId) {
      throw new ReusableBlockCircularReferenceException([...namesSoFar, namesSoFar[0]]);
    }
    if (visited.has(currentId) || visited.size >= MAX_CYCLE_WALK_VISITS) {
      return;
    }
    visited.add(currentId);

    const block = await this.repository.findById(currentId);
    if (!block) {
      return; // Dangling reference — not this validator's concern.
    }

    const nextNames = [...namesSoFar, block.name];
    const nestedIds = collectReusableBlockReferenceIds([
      {
        type: block.blockType,
        data: block.data as Record<string, unknown>,
        children: block.children as unknown as BlockNode[] | undefined,
      },
    ]);

    for (const nestedId of nestedIds) {
      await this.walk(nestedId, targetId, nextNames, visited);
    }
  }
}
