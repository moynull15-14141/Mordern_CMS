import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditPatternPageContent } from '@/features/patterns';

export default async function EditPatternPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <EditPatternPageContent patternId={id} />
    </PermissionRoute>
  );
}
