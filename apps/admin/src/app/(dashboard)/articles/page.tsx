import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function ArticlesPage() {
  return (
    <ComingSoonPage
      title="Articles"
      permissions={[
        PERMISSIONS.ARTICLE_CREATE,
        PERMISSIONS.ARTICLE_UPDATE,
        PERMISSIONS.ARTICLE_DELETE,
        PERMISSIONS.ARTICLE_PUBLISH,
      ]}
    />
  );
}
