import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { TagDetailPageContent } from '@/features/tags';

export default async function TagDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <TagDetailPageContent tagId={id} />
    </PermissionRoute>
  );
}
