import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { LayoutDetailPageContent } from '@/features/layouts';

export default async function LayoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.LAYOUT_MANAGE}>
      <LayoutDetailPageContent layoutId={id} />
    </PermissionRoute>
  );
}
