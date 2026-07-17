import { PUBLIC_ROUTES, ROUTES, type RouteValue } from '@/constants/routes';

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Builds a login redirect URL preserving the originally-requested path,
 * consumed by ProtectedRoute (docs/56 "Authentication"). */
export function buildLoginRedirectUrl(currentPath: string): string {
  if (isPublicRoute(currentPath)) return ROUTES.LOGIN;
  const params = new URLSearchParams({ redirect: currentPath });
  return `${ROUTES.LOGIN}?${params.toString()}`;
}

export function getRedirectTarget(
  searchParams: URLSearchParams,
  fallback: RouteValue = ROUTES.DASHBOARD
): string {
  const redirect = searchParams.get('redirect');
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return fallback;
  return redirect;
}
