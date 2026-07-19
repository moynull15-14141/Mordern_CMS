import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditLayoutPageContent } from '@/features/layouts';

export default async function EditLayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.LAYOUT_MANAGE}>
      <EditLayoutPageContent layoutId={id} />
    </PermissionRoute>
  );
}
