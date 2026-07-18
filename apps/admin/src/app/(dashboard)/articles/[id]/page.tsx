import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { ArticleDetailPageContent } from '@/features/articles';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute
      permissions={[
        PERMISSIONS.ARTICLE_CREATE,
        PERMISSIONS.ARTICLE_UPDATE,
        PERMISSIONS.ARTICLE_DELETE,
        PERMISSIONS.ARTICLE_PUBLISH,
      ]}
    >
      <ArticleDetailPageContent articleId={id} />
    </PermissionRoute>
  );
}
