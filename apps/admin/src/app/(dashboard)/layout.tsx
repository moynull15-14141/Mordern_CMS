import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

/** Dashboard route group — no business page exists beneath this yet
 * (Frontend Milestone 1 forbids Dashboard/Users/Articles/... pages); this
 * layout is infrastructure, ready for Frontend Milestone 2. */
export default function DashboardRouteGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
