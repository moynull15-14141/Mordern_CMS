import { ComingSoonPage } from '@/components/layout/coming-soon-page';

/** No permission requirement — any authenticated user may open this page
 * (docs/60_ADMIN_NAVIGATION.md: moderation actions are Action-Guard-gated
 * per-button, not Menu/Route-Guard-gated for the page itself). */
export default function CommentsPage() {
  return <ComingSoonPage title="Comments" />;
}
