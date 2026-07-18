import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { PageDetailPageContent } from '@/features/pages';

export default async function PageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <PageDetailPageContent pageId={id} />
    </PermissionRoute>
  );
}
