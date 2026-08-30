import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';

export interface PublicRedirect {
  destinationUrl: string;
  redirectType: number;
}

/** `GET /public/redirects/lookup?path=...` — resolves `null` on a miss
 * (the overwhelming common case), never throwing for "no redirect exists"
 * — only a genuine network/5xx failure propagates. Mirrors every other
 * public service's "404 is a legitimate result, not an error" handling. */
export async function getRedirectForPath(path: string): Promise<PublicRedirect | null> {
  try {
    return await publicFetch<PublicRedirect>(PUBLIC_API_ROUTES.REDIRECT_LOOKUP(path));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
