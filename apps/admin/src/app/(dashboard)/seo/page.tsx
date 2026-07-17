import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function SeoPage() {
  return <ComingSoonPage title="SEO" permissions={PERMISSIONS.SEO_MANAGE} />;
}
