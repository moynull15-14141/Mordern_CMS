import type { LayoutPresetName } from '../theme-renderer/utils/layout-preset.types';

/**
 * Which tier of the priority chain actually produced `preset` — Explicit
 * assignment -> Content default -> Theme default -> System default (the
 * milestone brief's own order). Purely informational (useful for a future
 * admin preview/debugging surface); `ThemeRenderer` only ever reads
 * `preset`.
 */
export type LayoutResolutionSource =
  'explicit' | 'content-default' | 'theme-default' | 'system-default';

export interface LayoutResolution {
  preset: LayoutPresetName;
  source: LayoutResolutionSource;
}

/** Mirrors `PublicLayoutResolutionResponseDto`
 * (`apps/backend/src/modules/layouts/dto/public-layout-resolution-response.dto.ts`)
 * field-for-field — the real, live response shape of
 * `GET /public/layouts/resolve`. Both fields independently nullable; the
 * backend collapses "no assignment at this tier" to `null`, never a 404
 * (a missing assignment is the common case, not an error). */
export interface PublicLayoutResolutionResponse {
  explicitLayoutPreset: string | null;
  contentDefaultLayoutPreset: string | null;
}

/** The four content types `GET /public/layouts/resolve` accepts — mirrors
 * the backend's own `PublicLayoutContentType`
 * (`apps/backend/src/modules/layouts/constants/public-layout-content-type.ts`). */
export type PublicLayoutContentType = 'home' | 'page' | 'article' | 'category';
