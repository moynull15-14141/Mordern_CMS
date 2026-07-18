import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditArticlePageContent } from '@/features/articles';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.ARTICLE_UPDATE}>
      <EditArticlePageContent articleId={id} />
    </PermissionRoute>
  );
}
