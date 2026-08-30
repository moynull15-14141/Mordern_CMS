import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditNavigationPageContent } from '@/features/navigation';

export default async function EditNavigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.MENU_MANAGE}>
      <EditNavigationPageContent menuId={id} />
    </PermissionRoute>
  );
}
