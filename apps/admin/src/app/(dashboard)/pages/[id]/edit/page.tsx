import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditPagePageContent } from '@/features/pages';

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <EditPagePageContent pageId={id} />
    </PermissionRoute>
  );
}
