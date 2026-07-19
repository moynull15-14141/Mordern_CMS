'use client';

import type { RenderContext } from '../types/render-context.types';
import { useTheme } from './use-theme';
import { useNavigation } from './use-navigation';
import { usePublicContent } from './use-public-content';
import { useLayout } from '../layout-engine/layout-context';

/**
 * Composes the provider-scoped hooks back into the full `RenderContext`
 * shape — for a Client Component deep in the tree (e.g. a future
 * header/footer) that wants everything at once instead of picking
 * individual slices. The Renderer itself (a Server Component) receives
 * `RenderContext` directly as a prop and does not need this hook.
 */
export function useRenderContext(): RenderContext {
  const { theme } = useTheme();
  const menus = useNavigation();
  const { site, settings, locale, seo, content } = usePublicContent();
  const layout = useLayout();

  return { theme, menus, site, settings, locale, seo, content, layout };
}
