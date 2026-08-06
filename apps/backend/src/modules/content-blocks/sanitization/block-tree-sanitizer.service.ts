import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { HTML_BLOCK_SANITIZE_OPTIONS } from './html-sanitize.config';

export interface SanitizeOptions {
  /**
   * Reserved seam for a future enterprise "trusted author" tier (e.g. a
   * role/permission that's allowed to author raw, unsanitized HTML) — not
   * wired to any permission check yet. `false`/omitted (the only path any
   * caller uses today) always sanitizes. Never default this to `true`.
   */
  trusted?: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Sanitizes every `html-block` node's `data.html` in a block tree —
 * called after `BlockTreeValidator.assertValid` succeeds and before the
 * Prisma write, in `ArticlesService`/`PagesService`/`ReusableBlocksService`.
 * A transform (returns a new tree), not a validation check, so it stays a
 * separate class from `BlockTreeValidator` — same "one responsibility per
 * class" reasoning the rest of this module follows (validator validates,
 * mapper maps, sanitizer sanitizes).
 *
 * Every other block type's string fields (paragraph text, button label,
 * etc.) are rendered as plain text by the public renderer (React
 * auto-escapes on render, never `dangerouslySetInnerHTML`) — `html-block`
 * is the only type whose `data` is ever interpreted as markup, so it's the
 * only type this walks.
 */
@Injectable()
export class BlockTreeSanitizer {
  sanitize(body: Record<string, unknown>, options: SanitizeOptions = {}): Record<string, unknown> {
    if (options.trusted) {
      return body;
    }
    const rawBlocks = Array.isArray(body.blocks) ? body.blocks : [];
    return { ...body, blocks: rawBlocks.map((node: unknown) => this.sanitizeNode(node)) };
  }

  /** Sanitizes a single reusable block's `{blockType, data, children}` —
   * used by `ReusableBlocksService`, which stores one block (with its own
   * nested children, for container types), not a full Page/Article tree.
   * Wraps into a one-node tree and unwraps, mirroring how
   * `ReusableBlocksService.assertValidBlockShape` already wraps for
   * `BlockTreeValidator`. `sanitizeNode` already recurses `children`
   * (used for the Page/Article path above) — this just needs to pass them
   * into and back out of that same wrap. */
  sanitizeBlockData(
    blockType: string,
    data: Record<string, unknown>,
    children: unknown[] | undefined,
    options: SanitizeOptions = {}
  ): { data: Record<string, unknown>; children?: unknown[] } {
    const sanitized = this.sanitize(
      { blocks: [{ id: 'sanitize-single-block', type: blockType, data, children }] },
      options
    );
    const [node] = sanitized.blocks as Array<{
      data: Record<string, unknown>;
      children?: unknown[];
    }>;
    return { data: node.data, children: node.children };
  }

  private sanitizeNode(node: unknown): unknown {
    if (!isPlainObject(node)) {
      return node;
    }
    const next: Record<string, unknown> = { ...node };

    if (
      node.type === 'html-block' &&
      isPlainObject(node.data) &&
      typeof node.data.html === 'string'
    ) {
      next.data = { ...node.data, html: sanitizeHtml(node.data.html, HTML_BLOCK_SANITIZE_OPTIONS) };
    }

    if (Array.isArray(node.children)) {
      next.children = (node.children as unknown[]).map((child) => this.sanitizeNode(child));
    }

    return next;
  }
}
