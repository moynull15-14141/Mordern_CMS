import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditReusableBlockPageContent } from '@/features/reusable-blocks';

export default async function EditReusableBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <EditReusableBlockPageContent blockId={id} />
    </PermissionRoute>
  );
}
