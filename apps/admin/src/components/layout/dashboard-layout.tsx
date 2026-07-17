import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer';

/** Dashboard Layout — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout
 * System". Composes Sidebar + Header + Footer + responsive drawer; the
 * ProtectedRoute guard wraps this at the route-group layout level
 * (app/(dashboard)/layout.tsx), not here, keeping this component
 * guard-agnostic and independently testable. */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileNavDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
