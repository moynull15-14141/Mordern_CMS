import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/** Root route — pure redirect infrastructure, no business UI. Frontend
 * Milestone 2 will add the actual /dashboard page this points to. */
export default function RootPage() {
  redirect(ROUTES.DASHBOARD);
}
