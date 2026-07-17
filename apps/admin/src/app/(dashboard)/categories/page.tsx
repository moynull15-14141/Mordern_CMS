import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function CategoriesPage() {
  return <ComingSoonPage title="Categories" permissions={PERMISSIONS.CATEGORY_CREATE} />;
}
