import type { PublicContentType } from '../../types/content.types';
import type { LayoutContentArea } from '../utils/layout-preset.types';

/** Maps a resolved content type to which real theme layout field governs
 * it — `home` reads `theme.layout.homepage`, `article`/`blog-list` both
 * read `theme.layout.blog` (the model has one `blog` field, not separate
 * list/detail fields), everything else has no dedicated field and always
 * gets `'default'` (see `resolve-layout-preset.util.ts`). */
export function resolveContentArea(contentType: PublicContentType): LayoutContentArea {
  switch (contentType) {
    case 'home':
      return 'home';
    case 'article':
    case 'blog-list':
      return 'blog';
    default:
      return 'default';
  }
}
