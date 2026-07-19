import type { RenderContext } from '../types/render-context.types';
import type { PublicNotFoundContent } from '../types/content.types';
import { PublicNotFound } from '../components/public-not-found';

export function NotFoundRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicNotFoundContent;
  const path = content.type === 'not-found' ? content.path : '';
  return <PublicNotFound path={path} />;
}
