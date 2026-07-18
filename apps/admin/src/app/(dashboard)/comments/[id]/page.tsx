import { CommentDetailPageContent } from '@/features/comments';

export default async function CommentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommentDetailPageContent commentId={id} />;
}
