import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { CommentsPageContent } from '@/features/comments';

export default function CommentsPage() {
  return (
    <SuspenseBoundary>
      <CommentsPageContent />
    </SuspenseBoundary>
  );
}
