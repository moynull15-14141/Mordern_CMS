import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditTagPageContent } from '@/features/tags';

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <EditTagPageContent tagId={id} />
    </PermissionRoute>
  );
}
