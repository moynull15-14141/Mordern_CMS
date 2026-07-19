import type { ReactNode } from 'react';
import type { SlotName } from './slot-names';

/**
 * The content a `ThemeRenderer` caller supplies per slot. Every slot is
 * optional — a content type that has nothing for a slot (most don't have
 * a `hero`, none currently populate `sidebar`) simply omits it, and the
 * active `Layout` renders nothing for that slot rather than an empty
 * wrapper (see `slot.tsx`).
 *
 * `content` is the one slot every route populates — it's always the real
 * `PublicRenderer` output for the resolved content
 * (`74_PUBLIC_RENDERING_FOUNDATION.md`'s existing Renderer, unchanged).
 */
export type ThemeSlots = Partial<Record<SlotName, ReactNode>>;
