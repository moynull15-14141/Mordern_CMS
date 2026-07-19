import Link from 'next/link';
import type { PublicSetting } from '../types/settings.types';
import { findSettingValue } from '../utils/settings-lookup.util';

/** Home page's closing "Footer CTA" section — real data only: the admin
 * contact email comes from `GET /public/settings` (`general.adminEmail`,
 * the closest real "contact information" — see
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known Limitations" for why there's
 * no dedicated contact-info setting). Omitted entirely if no email is
 * configured, rather than showing an empty/fake contact line. */
export function FooterCta({ settings }: { settings: PublicSetting[] | null }) {
  const adminEmail = findSettingValue<string>(settings, 'general.adminEmail');

  return (
    <section className="flex flex-col items-center gap-3 border-t border-gray-200 py-12 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Explore everything we publish</h2>
      <Link
        href="/blog"
        className="rounded-[var(--sportingspy-border-radius)] bg-[var(--sportingspy-color-primary)] px-5 py-2.5 text-sm font-medium text-white"
      >
        Visit the blog
      </Link>
      {adminEmail ? (
        <p className="text-sm text-gray-500">
          Questions? Reach us at{' '}
          <a href={`mailto:${adminEmail}`} className="underline">
            {adminEmail}
          </a>
        </p>
      ) : null}
    </section>
  );
}
